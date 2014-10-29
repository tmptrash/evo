/**
 * Interpreter of evo language. Main goal of this interpreter is to run the
 * script as fast as possible. It interprets code line by line from up to the
 * bottom. This module doesn't have any checks (maybe only minimal) to increase
 * running speed. In general script looks like simple assembler and has binary
 * format stored in UInt16Array. Every line of code is _LINE_SEGMENTS
 * words (two bytes) in this array. So, for evo interpreter - script is a
 * binary array of UInt16 words. Take a look at simple script
 *
 *     0000  0000  0001  0000        # set  1    zero
 *     0000  0001  0000  0001        # move zero one
 *     0000  0002  0001              # inc  one
 *
 * One standard script line format is:
 *
 *     label cmd   arg1  arg2  arg3  # segments description
 *     0000  0001  0002  0003  0000  # binary representation
 *  or       move  two   three       # readable representation
 *  or [0,   1,    2,    3,    0]    # JS Uint16Array representation
 * where:
 *     label - Unique label number. 0000 means no label
 *     cmd   - Command, like move, add, inc, jump and so on
 *     arg1  - First argument
 *     arg2  - Second argument
 *     arg3  - Third argument
 *
 * Previous example shows how script:
 *
 *     move two three
 *
 * is presented inside the interpreter. First 0000 means no label. Value greater
 * then 0000 means unique label number. Second 0001 means command index. For this
 * example is 'move' command. Two arguments 0002 and 0003 means two variables, with
 * appropriate indexes. So this line of code will move the value from variable
 * with index 0002 to variable with index 0003.
 *
 * Every command handler works in a similar way. It obtains only one parameter -
 * index of current command line in binary array. Using this index, current handler
 * may obtain all code line related info like: label, command and all arguments:
 *
 *     code[i - 1] label
 *     code[i + 0] cmd
 *     code[i + 1] arg1
 *     code[i + 2] arg2
 *     code[i + 3] arg3
 *
 * For example:
 *
 *     function _inc(i) {
 *         vars[code[i + 1]]++;
 *     }
 *
 * You should also note, that evo language should be read from left to the right.
 * For example command:
 *
 *     move two three
 *
 * Should be read as 'Move value of "two" variable into "three" variable' and not
 * like 'Move value of "three" variable into "two" variable'.
 *
 * Dependencies:
 *     Core
 *
 * Example:
 *     //
 *     // Binary representation of our two
 *     // lines script (4 words in each line)
 *     //
 *     var code = new Uint16Array(2 * 4);
 *
 *     // 0000 0007 0000 # set 7 zero
 *     code[0]  = 0;  // no label
 *     code[1]  = 0;  // set
 *     code[2]  = 7;  // 7
 *     code[3]  = 0;  // zero var
 *     code[4]  = 0;  // unused
 *
 *     // 0001 0000 0001 # move zero one
 *     code[5]  = 0;  // no label
 *     code[6]  = 1;  // move
 *     code[7]  = 0;  // zero var
 *     code[8]  = 1;  // one var
 *     code[9]  = 0;  // unused
 *
 *     Evo.Interpreter.run(code);
 *
 * @author DeadbraiN
 */
Evo.Interpreter = (function () {
    /**
     * @constant
     * {Number} Amount of segments (parts) in one script line: label, keyword, arg1, arg2
     */
    var _LINE_SEGMENTS = Evo.LINE_SEGMENTS;
    /**
     * {Object} Labels map. Key - label name, value - label line index started from zero.
     */
    var _labels = {};
    /**
     * {Uint16Array} Internal memory for reading and writing. Is used with 'read' and
     * 'write' command
     */
    var _mem = null;
    /**
     * {Array} Output array. Here organism will add it's numbers (outputs)
     */
    var _out = null;
    /**
     * {Number} Amount of numbers in binary script array
     */
    var _codeLen = null;
    /**
     * {Array} Array of variables values. Every variable has it's own unique index
     * started from zero. We use these indexes in different command. e.g.:
     *
     *     0000 0001 0002 0004 0000
     *          move two  four unused
     *
     *  It's important to have at least one zero variable, because all new generated
     *  command will be referenced to this zero variable as well.
     */
    var _vars = new Uint16Array(Evo.MAX_NUMBER);
    /**
     * {Number} Amount of variables within _vars
     */
    var _varsLen = 1;
    /**
     * {Array} Available commands by index. It's very important to keep these indexes
     * in a correct way, because all scripts will be broken.
     */
    var _cmds = [
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
        _echo    // 14
    ];


    /**
     * Puts one number into the output stream: Array
     * @param {Object} val Value to output
     */
    function _put(val) {
        _out.push(val);
    }

    /**
     * Checks if current binary script line is empty.
     * Empty means that all it's number are equal to zero.
     * @param {Uint16Array} code Entire script array
     * @param {Number} line Current script line index
     * @returns {Boolean}
     */
    function _emptyLine(code, line) {
        var i;
        var l = _LINE_SEGMENTS;

        for (i = 0; i < l; i++) {
            if (code[line + i]) {
                return false;
            }
        }

        return true;
    }
    /**
     * 'set' command handler. Initializes variable by specific value
     * Example: 0000 0001 0002 # set 0001 two
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
     * @param {Array} vars Array of variable values by index
     */
    function _set(code, i, vars) {
        var varIndex = code[i + 2];

        vars[varIndex] = code[i + 1];
        if (varIndex >= _varsLen) {
            _varsLen = varIndex;
        }
    }
    /**
     * 'move' command handler. Moves value from first argument to second one.
     * Example: 0000 0001 0001 0002 # move one two
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
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
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
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
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
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
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
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
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
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
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
     * @param {Array} vars Array of variable values by index
     */
    function _read(code, i, vars) {
        vars[code[i + 2]] = _mem[code[i + 1]];
    }
    /**
     * 'write' command handler. Writes one number from variable
     * to the memory by index. The memory is set from outside in run() method.
     * Example: 0007 0007 0001 # write 7 one
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
     * @param {Array} vars Array of variable values by index
     */
    function _write(code, i, vars) {
        _mem[code[i + 1]] = vars[code[i + 2]];
    }
    /**
     * 'jump' command handler. Jumps to specified label. Labels
     * are numeric. Zero label means no label.
     * Example: 0008 0007 # jump 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
     */
    function _jump(code, i) {
        return _labels[code[i + 1]];
    }
    /**
     * 'jumpg' command handler. Jumps to specified label if one
     * variable is greater then other. Labels are numeric. Zero
     * label means no label.
     * Example: 0009 0000 0001 0007 # jumpg zero one 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
     * @param {Array} vars Array of variable values by index
     */
    function _jumpg(code, i, vars) {
        return vars[code[i + 1]] > vars[code[i + 2]] ? _labels[code[i + 3]] : undefined;
    }
    /**
     * 'jumpl' command handler. Jumps to specified label if one
     * variable is less then other. Labels are numeric. Zero
     * label means no label.
     * Example: 000A 0000 0001 0007 # jumpl zero one 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
     * @param {Array} vars Array of variable values by index
     */
    function _jumpl(code, i, vars) {
        return vars[code[i + 1]] < vars[code[i + 2]] ? _labels[code[i + 3]] : undefined;
    }
    /**
     * 'jumpe' command handler. Jumps to specified label if one
     * variable is equals to other. Labels are numeric. Zero
     * label means no label.
     * Example: 000B 0000 0001 0007 # jumpe zero one 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
     * @param {Array} vars Array of variable values by index
     */
    function _jumpe(code, i, vars) {
        return vars[code[i + 1]] === vars[code[i + 2]] ? _labels[code[i + 3]] : undefined;
    }
    /**
     * 'jumpz' command handler. Jumps to specified label if a
     * variable is equals to zero. Labels are numeric. Zero
     * label means no label.
     * Example: 000C 0000 0007 # jumpz one 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
     * @param {Array} vars Array of variable values by index
     */
    function _jumpz(code, i, vars) {
        return vars[code[i + 1]] === 0 ? _labels[code[i + 2]] : undefined;
    }
    /**
     * 'jumpn' command handler. Jumps to specified label if a
     * variable is not equal to zero. Labels are numeric. Zero
     * label means no label.
     * Example: 000D 0000 0007 # jumpz one 7
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
     * @param {Array} vars Array of variable values by index
     */
    function _jumpn(code, i, vars) {
        return vars[code[i + 1]] !== 0 ? _labels[code[i + 2]] : undefined;
    }
    /**
     * 'echo' command handler. Echoes (outputs) a value of specified
     * variable. Example: 000E 0000 # echo one
     *
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line + 1. It points
     * to the command and not to the label.
     * @param {Array} vars Array of variable values by index
     */
    function _echo(code, i, vars) {
        return _put(vars[code[i + 1]]);
    }


    //
    // public section
    //
    return {
        /**
         * @param {Uint16Array} code Lines of code in binary format
         * @param {Uint16Array} mem Memory for read and write commands
         * @param {Array} out Output stream
         */
        analyze: function (code, mem, out) {
            var i;
            var l      = code.length;
            var labels = _labels;
            var segs   = _LINE_SEGMENTS;

            //
            // Memory block, which is set from outside and
            // should be used by current script
            //
            _mem = mem;
            //
            // Output stream (Array). Here organism must puts it's output numbers
            //
            _out = out;
            //
            // We need to reset all variables states for every new run
            //
            _varsLen = 1;
            //
            // All labels will be saved in _labels field. _codeLen field will be
            // set to amount of numbers in binary script.
            //
            _codeLen = null;
            _labels  = {};
            for (i = 0; i < l; i += segs) {
                if (code[i]) {labels[code[i]] = i + 1;} // + 1 means index of command and not a label
                if (_codeLen === null && _emptyLine(code, i)) {_codeLen = i; break;}
            }
        },

        /**
         * Runs an interpreter till last script code line will be finished.
         * @param {Uint16Array} code Lines of code in binary format
         * @param {Uint16Array} mem Memory for read and write commands
         * @param {Array} out Output stream
         */
        run: function (code, mem, out) {
            var i;
            var vars = _vars;
            var segs = _LINE_SEGMENTS;
            var cmds = _cmds;
            var line;

            this.analyze(code, mem, out);
            //
            // This is a main loop, where all commands are ran.
            // i === 1, because we loop thought commands (not labels)
            //
            i = 1;
            while (i < _codeLen) {
                line = cmds[code[i]](code, i, vars);
                if (line) {
                    i = line;
                } else {
                    i += segs;
                }
            }
        },

        /**
         * @readonly
         * Returns labels map. See _labels field for details
         * @return {Object}
         */
        getLabels: function () {
            return _labels;
        },

        /**
         * Returns length of code. The length of the code is not its
         * allocated size in array.
         * @return {Number}
         */
        getLength: function () {
            return _codeLen || 0;
        },

        /**
         * @readonly
         * @returns {Number} Returns amount of real variables
         */
        getVarsLen: function () {
            return _varsLen;
        }
    };
})();