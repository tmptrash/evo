/**
 * Interpreter of evo language. Main goal of this interpreter is to run the
 * script as fast as possible. It interprets code line by line from up to the
 * bottom. This module doesn't have any checks (maybe only minimal) to increase
 * running speed. In general script looks like simple assembler and has binary
 * format stored in UInt16Array. Every line of code is _LINE_SEGMENTS
 * words (two bytes) in this array. So, for evo interpreter - script is a
 * binary array of UInt16 words. Take a look at simple script
 *
 *     0000 0000 0001 0000       # set  1    zero
 *     0000 0001 0000 0001       # move zero one
 *     0000 0002 0001            # inc  one
 *
 * One standard script line format is:
 *
 *     label cmd   arg1  arg2    # segments description
 *     0000  0001  0002  0003    # binary representation
 *  or      move  two   three   # readable representation
 *  or [0,   1,    2,    3]      # JS representation
 * where:
 *     label - Unique label number. 0000 means no label
 *     cmd   - Command, like move, add, inc, jump and so on
 *     arg1  - First argument. In most case the index of variable
 *     arg2  - Second argument. In most case the index of variable
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
 *     code[i + 0] label
 *     code[i + 1] cmd
 *     code[i + 2] arg1
 *     code[i + 3] arg2
 *
 * For example:
 *
 *     function _inc(i) {
 *         vars[code[i + 2]]++;
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
 *     // set 7 zero
 *     code[0]  = 0;  // no label
 *     code[1]  = 0;  // set
 *     code[2]  = 7;  // 7
 *     code[3]  = 0;  // zero var
 *
 *     // move zero one
 *     code[4]  = 0;  // no label
 *     code[5]  = 1;  // move
 *     code[6]  = 0;  // zero var
 *     code[7]  = 1;  // one var
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
    var _LINE_SEGMENTS = 4;
    /**
     * {Object} Labels map. Key - label name, value - label line index started from zero.
     */
    var _labels = {};
    /**
     * {Array} Array of variables values. Every variable has it's own unique index
     * started from zero. We use these indexes in different command. e.g.:
     *
     *     0000 0001 0002 0004
     *          move two  four
     */
    var _vars = [];
    /**
     * {Array} Available commands by index. It's very important to keep these indexes
     * in a correct way, because all scripts will be broken.
     */
    var _cmds = [
        _set,    // 0
        _move,   // 1
        _inc     // 2
    ];

    /**
     * 'set' command handler. Initializes variable by specific value
     * Example: 0000 0001 0002 # set 0001 two
     * @param {Array} vars Array of variable values by index
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     */
    function _set(vars, code, i) {
        vars[code[i + 3]] = code[i + 2];
    }
    /**
     * move command handler. Moves value from first argument to second one.
     * Example: move one two -> 0000 0001 0001 0002
     * @param {Array} vars Array of variable values by index
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     */
    function _move(vars, code, i) {
        vars[code[i + 3]] = vars[code[i + 2]];
    }
    /**
     * inc command handler. Increments variable.
     * Example: inc one # 0002 0001
     * @param {Array} vars Array of variable values by index
     * @param {Uint16Array} code Script in binary representation
     * @param {Number} i Index of current code line
     */
    function _inc(vars, code, i) {
        vars[code[i + 2]]++;
    }


    //
    // public section
    //
    return {
        /**
         * Runs an interpreter
         * TODO:
         * @param {Uint16Array} code Lines of code in binary
         * @return {Boolean} true - all ok, false - not
         */
        run: function (code) {
            var i;
            var l    = code.length;
            var vars = _vars;

            //
            // All labels will be saved in _labels field
            //
            for (i = 0; i < l; i+=_LINE_SEGMENTS) {
                if (code[i]) {_labels[code[i]] = i;}
            }
            //
            // This is a main loop, where all commands are ran
            //
            i = 0;
            while (i < l) {
                i += (_cmds[code[i + 1]](vars, code, i) || _LINE_SEGMENTS);
            }
        }
    };
})();