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
 *     Core
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
 *     Evo.Interpreter.run(code);
 *
 * @author DeadbraiN
 */
Evo.Interpreter = (function () {
    /**
     * @constant
     * {Number} Amount of segments (parts) in one script line: command, arg1, arg2, arg3.
     * This variable it just a shortcut for performance interpreter issue.
     */
    var _LINE_SEGMENTS = Evo.LINE_SEGMENTS;
    /**
     * @constant
     * {Number} Amount of internal variables
     */
    var _VARS_AMOUNT   = 8;

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
    var _out      = null;
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
     * {Array} Available commands by index. It's very important to keep these indexes
     * in a correct way, otherwise all scripts may be broken.
     */
    var _cmds     = [
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
        _shr     // 23
    ];


    /**
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
     * variable. Example: 000E 0000 # echo one
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _echo(code, i, vars) {
        _out.push(vars[code[i + 1]]);
    }
    /**
     * 'or' command handler. Does Bitwise OR.
     * Example: 000F 0000 0001 # or one two. Result will be stored
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
     * Example: 0010 0000 0001 # and one two. Result will be stored
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
     * Example: 0011 0000 0001 # xor one two. Result will be stored
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
     * Example: 0012 0000 0001 # not one two. Result will be stored
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
     * Example: 0013 0000 0001 # mul one two. Result will be stored
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
     * Example: 0014 0000 0001 # div one two. Result will be stored
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
     * Example: 0015 0000 0001 # rem one two. Result
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
     * Example: 0016 0000 0001 # shl one two. Result
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
     * Example: 0017 0000 0001 # sgr one two. Result
     * will be stored in second variable
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     * @param {Array} vars Array of variable values by index
     */
    function _shr(code, i, vars) {
        vars[code[i + 2]] >>= vars[code[i + 1]];
    }


    //
    // public section
    //
    return {
        /**
         * @constant
         * {Number} Amount of internal variables
         */
        VARS_AMOUNT: _VARS_AMOUNT,
        /**
         * Runs an interpreter till last script code line will be finished.
         * @param {Uint16Array} code Lines of code in binary format
         * @param {Uint16Array} mem Memory for read and write commands
         * @param {Array=} out Output stream
         * @param {Number=} codeLen Amount of words (Uint16) in binary script
         * If is not set, then it will be set to code.length
         */
        run: function (code, mem, out, codeLen) {
            var vars = _vars;
            var segs = _LINE_SEGMENTS;
            var cmds = _cmds;
            var i;
            var line;

            //
            // Memory block, which is set from outside and
            // should be used by current script
            //
            _mem = mem;
            //
            // Output stream (Array). Here organism must puts it's output numbers
            //
            _out = out = out || [];
            //
            // _codeLen field will be set to amount of numbers in binary script.
            //
            _codeLen = codeLen = (codeLen === undefined ? code.length : codeLen);
            //
            // We need to clear all internal variables every time when new run is called
            //
            _vars.set(_zeroVars);
            //
            // This is a main loop, where all commands are ran.
            // i === 1, because we loop thought commands
            //
            i = 0;
            while (i < codeLen) {
                line = cmds[code[i]](code, i, vars);
                if (line) {
                    i = line;
                } else {
                    i += segs;
                }
            }
        },

        /**
         * Returns length of code. The length of the code is not its
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
        }
    };
})();