/**
 * TODO: add functions support
 *
 * Interpreter of evo language. Main goal of this interpreter is to run the
 * script as fast as possible. It interprets code line by line from up to the
 * bottom. This module doesn't have any checks (maybe only minimal) to increase
 * running speed. In general script looks like simple assembler and has binary
 * format stored in UInt16Array. Every line of code is _LINE_SEGMENTS
 * words (two bytes) in this array. So, for evo interpreter - script is a
 * binary array of UInt16 words. Take a look at simple script:
 *
 *     0000  0001  0000        # set  1    zero
 *     0001  0000  0001        # move zero one
 *     0002  0001              # inc  one
 *
 * I cut this array into three lines for best look, because for interpreter
 * it's one binary array. Every script line has strict format like this:
 *
 *     0001  0002  0003  0000  # binary representation
 *     cmd   arg1  arg2  arg3  # segments description
 *  or move  two   three       # readable representation
 *  or [1,   2,    3,    0]    # JS Uint16Array representation
 *
 * where:
 *
 *     cmd   - Command, like move, add, inc, jump and so on
 *     arg1  - First argument
 *     arg2  - Second argument
 *     arg3  - Third argument
 *
 * If some command has only one argument, then other arguments will be filled
 * by zero values like this:
 *
 *     0002  0000  000  0000   # inc 0
 *
 * Two last arguments is unused in this case, but they needed for interpreter
 * performance. Previous example shows how script:
 *
 *     0001  0002  0003        # move two three
 *
 * is presented inside the interpreter. First 0001 means command index. For this
 * example is 'move' command. Two arguments 0002 and 0003 means two variables, with
 * appropriate indexes. So, this line of code will move the value from variable
 * with index 0002 to variable with index 0003.
 * Every command handler works in a similar way. It obtains only one parameter -
 * index of current command line in binary array. Using this index, current handler
 * may obtain all code line related info like: command and all arguments:
 *
 *     code[i + 0] cmd
 *     code[i + 1] arg1
 *     code[i + 2] arg2
 *     code[i + 3] arg3
 *
 * For example:
 *
 *     function _inc(code, i, vars) {
 *         vars[code[i + 1]]++;
 *     }
 *
 * You should also note, that evo language should be read from left to the right.
 * For example command:
 *
 *     0001  0002  0003        # move two three
 *
 * Should be read as 'Move value of "two" variable into "three" variable' and not
 * like 'Move value of "three" variable into "two" variable'.
 *
 * Another important moment is interpreter direction. It's only from top to the
 * bottom. So all jump commands (jump, jumpz, jumpe,...) may jump only deeper
 * then current line (line with current jump command). It's needed for excluding
 * infinite loops inside the script.
 *
 * Dependencies:
 *     Evo
 *
 * Example:
 *     //
 *     // Binary representation of our two lines
 *     // script (Evo.LINE_SEGMENTS words in each line)
 *     //
 *     var code = new Uint16Array(2 * Evo.LINE_SEGMENTS);
 *
 *     // 0000 0007 0000 # set 7 zero
 *     code[0]  = 0;  // set
 *     code[1]  = 7;  // 7
 *     code[2]  = 0;  // zero var
 *
 *     // 0001 0000 0001 # move zero one
 *     code[4]  = 1;  // move
 *     code[5]  = 0;  // zero var
 *     code[6]  = 1;  // one var
 *
 *     (new Evo.Interpreter).run(code);
 *
 * @author DeadbraiN
 */
Evo.Interpreter = function Interpreter() {
    /**
     * @constant
     * {Number} Amount of segments (parts) in one script line: command, arg1, arg2, arg3.
     * This variable it just a shortcut for performance interpreter issue.
     */
    var _LINE_SEGMENTS   = 4;
    /**
     * {Number} Maximum memory size in words. This value shouldn't be
     * greater then word (65535), because commands like read and write
     * may address only 65535 index in it.
     */
    var _MAX_MEMORY_SIZE = 65535;
    /**
     * @constant
     * {Number} Amount of internal variables
     */
    var _VARS_AMOUNT     = 8;

    /**
     * {Uint16Array} Internal memory for reading and writing. Is used with 'read' and
     * 'write' command. Memory may be set from outside. It stores it's values between
     * script runs.
     */
    var _mem      = null;
    /**
     * {Array} Output stream. Here organism will add it's numbers (outputs). This
     * is an analogy of communication channel between organism and environment.
     */
    var _output   = null;
    /**
     * {Number} Amount of numbers in binary script array. This is an amount of all
     * words. This is not an amount of code lines. You may calculate amount of
     * script words by formula: amountOfLines * _LINE_SEGMENTS .
     */
    var _codeLen  = null;
    /**
     * {Array} Array of variables values. Every variable has it's own unique index
     * started from zero. We use these indexes in different command. e.g.:
     *
     *      0001 0002 0004 0000
     *      move two  four unused
     *
     *  It's important to have at least one zero variable, because all new generated
     *  command will be referenced to this zero variable from scratch. Because
     *  Uint16Array immutable, we need to allocate big amount of data from start.
     */
    var _vars     = new Uint16Array(_VARS_AMOUNT);
    /**
     * {Uint16Array} Zero valued array, which is used for clearing of _vars field. We
     * need to do it every time, then run() method is called. Because previous variables
     * states, shouldn't affect to current running.
     */
    var _zeroVars = new Uint16Array(_VARS_AMOUNT);
    /**
     * {Function} Default empty callback function for stubbing
     */
    var _emptyFn  = function () {};
    /**
     * {Function} Input command callback. Is set from outside in run() method and is called
     * from in command. Should contain at least one parameter - another callback, which will
     * be called when the answer will be obtained. This, second callback has ne parameter -
     * obtained data. See run() method config.inCb description for details.
     */
    var _inCb      = _emptyFn;
    /**
     * {Function} The same like inCb, but without callback parameter. Callback has three
     * custom parameters. You may use them what every you want. See run() method
     * config.outCb description for details.
     */
    var _outCb     = _emptyFn;
    /**
     * {Function} Callback, which is called when an organism is moving. It should be set from
     * outside. Has one parameter - direction. There are four directions: 0 - up, 1 - right,
     * 2 - bottom, 3 - left
     */
    var _stepCb    = _emptyFn;
    /**
     * {Function} Callback for eat command. It means that current organism eats one point of energy
     * from the particle, which is near. It may be other organism or just a particle of the world.
     * Has one parameter - direction: 0 - up, 1 - right, 2 - bottom, 3 - left.
     */
    var _eatCb     = _emptyFn;
    /**
     * {Function} Callback for echo command. It's called every time then organism generates some
     * output information. This is an analog of saying something. Has one parameter - output number.
     */
    var _echoCb    = _emptyFn;
    /**
     * {Function} Callback for clone command. Is called to inform outside code about cloning and
     * amount of energy for new created child organism.
     */
    var _cloneCb   = _emptyFn;
    /**
     * {Boolean} Means that now, script should be stopped
     */
    var _stopped   = false;
    /**
     * {Evo.Interpreter} this shortcut
     */
    var _me        = null;
    /**
     * {Number} Last index in binary script. If may be last one or index of command on which
     * we were break the script.
     */
    var _lastIndex = 0;
    /**
     * {Array} Available commands by index. It's very important to keep these indexes
     * in a correct way, otherwise all scripts may be broken.
     */
    var _cmds      = [
        _set,    // 0
        _move,   // 1
        _inc,    // 2
        _dec,    // 3
        _add,    // 4
        _sub,    // 5
        _read,   // 6
        _write,  // 7
        _jump,   // 8
        _jumpg,  // 9
        _jumpl,  // 10
        _jumpe,  // 11
        _jumpz,  // 12
        _jumpn,  // 13
        _echo,   // 14
        _or,     // 15
        _and,    // 16
        _xor,    // 17
        _not,    // 18
        _mul,    // 19
        _div,    // 20
        _rem,    // 21
        _shl,    // 22
        _shr,    // 23
        _in,     // 24
        _out,    // 25
        _step,   // 26
        _eat,    // 27
        _clone   // 28
    ];


    /*
     * 'set' command handler. Initializes variable by specific value
     * Example: 0000 0001 0002 # set 0001 two
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _set(code, i, vars) {
        vars[code[i + 2]] = code[i + 1];
    }
    /**
     * 'move' command handler. Moves value from first argument to second one.
     * Example: 0001 0001 0002 # move one two
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _move(code, i, vars) {
        vars[code[i + 2]] = vars[code[i + 1]];
    }
    /**
     * 'inc' command handler. Increments a variable. If the value
     * equals to 65535 and will be incremented, then it will be zero.
     * Example: 0002 0001 # inc one
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _inc(code, i, vars) {
        vars[code[i + 1]]++;
    }
    /**
     * 'dec' command handler. Decrements a variable. It's important
     * that you can decrease zero variable. 0-- === 65535.
     * Example: 0003 0001 # dec one
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _dec(code, i, vars) {
        vars[code[i + 1]]--;
    }
    /**
     * 'add' command handler. Sums two variables and puts the
     * result into second variable. Important: 65535 + 1 === 0.
     * 65535 + 2 === 1 and so on.
     * Example: 0004 0001 0002 # add one two
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _add(code, i, vars) {
        vars[code[i + 2]] += vars[code[i + 1]];
    }
    /**
     * 'sub' command handler. Substitutes two variables and puts the
     * result into second variable. Important: 0 - 1 === 65535,
     * 0 - 2 === 65534 and so on.
     * Example: 0005 0001 0002 # sub one two
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _sub(code, i, vars) {
        vars[code[i + 2]] -= vars[code[i + 1]];
    }
    /**
     * 'read' command handler. Reads one number from the memory by index.
     * The memory is set from outside in run() method.
     * Example: 0006 0007 0001 # read 7 one
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _read(code, i, vars) {
        vars[code[i + 2]] = _mem[vars[code[i + 1]]];
    }
    /**
     * 'write' command handler. Writes one number from variable
     * to the memory by index. The memory is set from outside in run() method.
     * Example: 0007 0007 0001 # write 7 one
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _write(code, i, vars) {
        _mem[vars[code[i + 1]]] = vars[code[i + 2]];
    }
    /**
     * 'jump' command handler. Jumps to specified line.
     * Example: 0008 0007 # jump 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @return {Number|undefined} New code line index
     */
    function _jump(code, i) {
        return code[i + 1];
    }
    /**
     * 'jumpg' command handler. Jumps to specified line if one
     * variable is greater then other.
     * Example: 0009 0000 0001 0007 # jumpg zero one 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     * @return {Number|undefined} New code line index or undefined
     */
    function _jumpg(code, i, vars) {
        return vars[code[i + 1]] > vars[code[i + 2]] ? code[i + 3] : undefined;
    }
    /**
     * 'jumpl' command handler. Jumps to specified line if one
     * variable is less then other.
     * Example: 000A 0000 0001 0007 # jumpl zero one 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     * @return {Number|undefined} New code line index or undefined
     */
    function _jumpl(code, i, vars) {
        return vars[code[i + 1]] < vars[code[i + 2]] ? code[i + 3] : undefined;
    }
    /**
     * 'jumpe' command handler. Jumps to specified line if one
     * variable is equals to other.
     * Example: 000B 0000 0001 0007 # jumpe zero one 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     * @return {Number|undefined} New code line index or undefined
     */
    function _jumpe(code, i, vars) {
        return vars[code[i + 1]] === vars[code[i + 2]] ? code[i + 3] : undefined;
    }
    /**
     * 'jumpz' command handler. Jumps to specified label if a
     * variable is equals to zero.
     * Example: 000C 0000 0007 # jumpz one 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     * @return {Number|undefined} New code line index or undefined
     */
    function _jumpz(code, i, vars) {
        return vars[code[i + 1]] === 0 ? code[i + 2] : undefined;
    }
    /**
     * 'jumpn' command handler. Jumps to specified line if a
     * variable is not equal to zero.
     * Example: 000D 0000 0007 # jumpz one 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     * @return {Number|undefined} New code line index or undefined
     */
    function _jumpn(code, i, vars) {
        return vars[code[i + 1]] !== 0 ? code[i + 2] : undefined;
    }
    /**
     * 'echo' command handler. Echoes (outputs) a value of specified
     * variable. Example: 000E 0001 # echo one
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _echo(code, i, vars) {
        _output.push(vars[code[i + 1]]);
    }
    /**
     * 'or' command handler. Does Bitwise OR.
     * Example: 000F 0001 0002 # or one two. Result will be stored
     * in second variable
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _or(code, i, vars) {
        vars[code[i + 2]] |= vars[code[i + 1]];
    }
    /**
     * 'and' command handler. Does Bitwise AND.
     * Example: 0010 0001 0002 # and one two. Result will be stored
     * in second variable
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _and(code, i, vars) {
        vars[code[i + 2]] &= vars[code[i + 1]];
    }
    /**
     * 'xor' command handler. Does Bitwise XOR.
     * Example: 0011 0001 0002 # xor one two. Result will be stored
     * in second variable
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _xor(code, i, vars) {
        vars[code[i + 2]] ^= vars[code[i + 1]];
    }
    /**
     * 'not' command handler. Does Bitwise NOT.
     * Example: 0012 0001 0002 # not one two. Result will be stored
     * in second variable
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _not(code, i, vars) {
        vars[code[i + 2]] = ~vars[code[i + 1]];
    }
    /**
     * 'mul' command handler. Does division.
     * Example: 0013 0001 0002 # mul one two. Result will be stored
     * in second variable
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _mul(code, i, vars) {
        vars[code[i + 2]] *= vars[code[i + 1]];
    }
    /**
     * 'mul' command handler. Does multiplication. In case of zero,
     * the result will be also zero. This is an ability of Uint16 type.
     * Example: 0014 0001 0002 # div one two. Result will be stored
     * in second variable
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _div(code, i, vars) {
        vars[code[i + 2]] /= vars[code[i + 1]];
    }
    /**
     * 'rem' command handler. Calculates reminder from division.
     * Example: 0015 0001 0002 # rem one two. Result
     * will be stored in second variable
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _rem(code, i, vars) {
        vars[code[i + 2]] %= vars[code[i + 1]];
    }
    /**
     * 'shl' command handler. Bitwise left shift operator.
     * Example: 0016 0001 0002 # shl one two. Result
     * will be stored in second variable
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _shl(code, i, vars) {
        vars[code[i + 2]] <<= vars[code[i + 1]];
    }
    /**
     * 'shr' command handler. Bitwise right shift operator.
     * Example: 0017 0001 0002 # shr one two. Result
     * will be stored in second variable
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _shr(code, i, vars) {
        vars[code[i + 2]] >>= vars[code[i + 1]];
    }
    /**
     * 'in' command handler. Obtains input command from
     * specified sensor.
     * Example: 0018 0001 0002 0003 # in one two. Result
     * will be stored in second variable. This example
     * means 'get word from 0001 and 0002 sensor and store
     * it in 0003 variable'.
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    // TODO: think about optimization of this code. It's very
    // TODO: very slow, because of inter threading communication
    function _in(code, i, vars) {
        _stopped = true;
        _inCb(function (data) {
            vars[code[i + 3]] = data;
            _stopped = false;
            _me.run({i: _lastIndex, code: code});
        }, vars[code[i + 1]], vars[code[i + 2]]);
    }
    /**
     * 'out' command handler. Send command to specified sensor.
     * Example: 0019 0001 0002 0003 # out one two. This example
     * means 'put word from 0002 and 0003 variable into 0001 sensor'
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _out(code, i, vars) {
        _outCb(vars[code[i + 1]], vars[code[i + 2]], vars[code[i + 3]]);
    }
    /**
     * 'step' command handler. Do one step with specified
     * direction.
     * Example: 001A 0001 # step one. This example means
     * 'do one step in 0001 direction'. There are four
     * directions: 0 - up, 1 - right, 2 - bottom, 3 - left
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _step(code, i, vars) {
        _stepCb(vars[code[i + 1]]);
    }
    /**
     * 'eat' command handler. Grabs an energy point from nearest
     * particle.
     * Example: 001B 0001 # eat one. This example means
     * 'grab one energy point from 0001 direction'. There are four
     * directions: 0 - up, 1 - right, 2 - bottom, 3 - left
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _eat(code, i, vars) {
        _eatCb(vars[code[i + 1]]);
    }
    /**
     * 'clone' command handler. Clones current organism into current
     * and child.
     * Example: 001C 0001 # clone one. This example means
     * 'clone organism and pass an energy from 0001 var into the child'.
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _clone(code, i, vars) {
        _cloneCb(vars[code[i + 1]]);
    }


    //
    // public section
    //
    return (_me = {
        /**
         * @constant
         * {Number} Amount of internal variables
         */
        VARS_AMOUNT: _VARS_AMOUNT,
        /**
         * Runs an interpreter till last script code line will be finished. This
         * method may be broken by some asynchronous command (e.g. in, out) and
         * continued in future. For this, you should run it again with i parameter.
         * Like this: interpreter.run({i: lastLineIndex})
         * @param {Object}      cfg     Configuration of interpreter
         *        {Uint16Array} code    Lines of code in binary format
         *        {Uint16Array} mem     Memory for read and write commands
         *        {Array=}      out     Output stream
         *        {Number=}     codeLen Amount of words (Uint16) in binary script.
         *        {Number=}     i       Start index in script. Default is zero.
         *        {Function}    inCb    Input command callback. Is used for calls
         *                              from external code, which gets any input
         *                              data. External code may be asynchronous,
         *                              so this callback should be called with
         *                              another callback in first parameter. This
         *                              second callback will be called by outside
         *                              code, when the data will be received.
         *                              Example:
         *                                  (new Evo.Interpreter).run({
         *                                      code: code,
         *                                      inCb: function (finalCb) {
         *                                          var data = this.getData();
         *                                          ...
         *                                          finalCb(data);
         *                                      }
         *                                  });
         *        {Function}    outCb   Output command callback. The same like
         *                              input callback, but without parameter.
         *                              It has three custom parameters. They may
         *                              address specific sensor in two first
         *                              parameters and pass some value in the last.
         *                              Example:
         *                                  (new Evo.Interpreter).run({
         *                                      code : code,
         *                                      outCb: function (p1,p2,p3) {
         *                                          // do something with parameters
         *                                      }
         *                                  });
         *                              This command is synchronous.
         *        {Function}    stepCb  Callback for step command. Is used for
         *                              signalize some outside code about one
         *                              single step of organism. Very similar to
         *                              outCb, but with one parameter - direction
         *                              of stepping: 0 - up, 1 - right, 2 - bottom,
         *                              3 - left. It makes one step using this
         *                              direction. This command is synchronous.
         *                              Example:
         *                                  (new Evo.Interpreter).run({
         *                                      code  : code,
         *                                      stepCb: function (direction) {
         *                                          // do something with direction
         *                                      }
         *                                  });
         *        {Function}    eatCb   Callback for eat command. Is used for
         *                              signalize of outside code about eating
         *                              one point of energy using specified direction:
         *                              0 - upper particle, 1 - right particle, 2 -
         *                              bottom particle, 3 - left particle. This
         *                              command is synchronous.
         *                              Example:
         *                                  (new Evo.Interpreter).run({
         *                                      code  : code,
         *                                      stepCb: function (direction) {
         *                                          // do something with direction
         *                                      }
         *                                  });
         *        {Function}    echoCb  Callback for echo. Signalizes outside code
         *                              about new echo data. This command is
         *                              synchronous.
         *                              Example:
         *                                  (new Evo.Interpreter).run({
         *                                      code  : code,
         *                                      stepCb: function (direction) {
         *                                          // do something with direction
         *                                      }
         *                                  });
         *        {Function}    cloneCb Callback for clone. Signalizes outside code
         *                              about new organism creation. This command is
         *                              synchronous.
         *                              Example:
         *                                  (new Evo.Interpreter).run({
         *                                      code  : code,
         *                                      cloneCb: function () {
         *                                          // do something
         *                                      }
         *                                  });
         *
         * If is not set, then it will be set to code.length
         */
        run: function (cfg) {
            cfg         = cfg || {};
            var vars    = _vars;
            var segs    = _LINE_SEGMENTS;
            var cmds    = _cmds;
            var code    = cfg.code || [];
            var i       = cfg.i || 0;
            var codeLen;
            var line;

            //
            // Memory block, which is set from outside and
            // should be used by current script
            //
            _mem = cfg.mem || _mem || new Uint16Array(_MAX_MEMORY_SIZE);
            //
            // Output stream (Array). Here organism must puts it's output numbers
            //
            _output = cfg.out || _output || [];
            //
            // _codeLen field will be set to amount of numbers in binary script.
            //
            _codeLen = codeLen = _codeLen || +cfg.codeLen || code.length;
            //
            // We need to clear all internal variables every time when new run is called.
            // If we continue execution then we need to skip this.
            //
            if (i === 0) {
                _vars.set(_zeroVars);
                //
                // Callback methods for commands like in, out, step, eat...
                //
                _inCb    = cfg.inCb    || _inCb;
                _outCb   = cfg.outCb   || _outCb;
                _stepCb  = cfg.stepCb  || _stepCb;
                _eatCb   = cfg.eatCb   || _eatCb;
                _echoCb  = cfg.echoCb  || _echoCb;
                _cloneCb = cfg.cloneCb || _cloneCb;
            }
            while (i < codeLen && !_stopped) {
                line = cmds[code[i]](code, i, vars);
                i = (line ? line : i + segs);
            }
            _lastIndex = i;
        },
        /**
         * Returns length of code. The length of the code is not it's
         * allocated size in array.
         * @return {Number}
         */
        getCodeLen: function () {
            return _codeLen || 0;
        },
        /**
         * Returns variables array
         * @return {Uint16Array}
         */
        getVars: function () {
            return new Uint16Array(_vars);
        },
        /**
         * Returns output stream
         * @returns {Array}
         */
        getOutput: function () {
            return _output;
        }
    });
};