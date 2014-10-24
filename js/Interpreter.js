/**
 * Interpreter of evo language. Main goal of this interpreter is to interpret
 * as fast as possible. It interprets code line by line from up to the bottom.
 * This module doesn't have any checks (maybe only minimal) to increase running
 * speed.
 * Script on evo language is presented by UInt16Array. Every line of code is
 * _MAX_LINE_SEGMENTS words (two bytes) in this array. Script line format is:
 *
 *     label cmd   arg1  arg2
 *     0000  0001  0002  0003   # move two three -> [0, 1, 2, 3]
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
 * example is move command. Two arguments 0002 and 0003 means two variables, with
 * appropriate indexes. So this line of code will move the value from variable
 * with index 0002 to variable with index 0003.
 *
 * Dependencies:
 *     Core
 *
 * Example:
 *     // two lines of code
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
    //
    // private section
    //

    /**
     * @constant
     * {Number} Amount of segments (parts) in one code line: label, keyword, argument, argument
     */
    var _MAX_LINE_SEGMENTS = 4;
    /**
     * {UInt16Array} Array of code to interpret. This code has binary representation. See
     * it's description at the top of the file.
     */
    var _code = null;
    /**
     * {Object} Labels map. Key - label name, value - label line index
     */
    var _labels = {};
    /**
     * {Array} Array of variables values. Every variable has it's
     * own unique index started from zero.
     */
    var _vars = [];
    /**
     * {Array} Available commands by index
     */
    var _cmds = [
        _set,
        _move,
        _inc
    ];

    /**
     * move command handler. Moves value from 'from' to 'to' variable.
     * Example: move one two # 0001 0001 0002
     * @param {Number} i Index of current code line
     */
    function _set(i) {
        _vars[_code[i + 3]] = _code[i + 2];
    }
    /**
     * move command handler. Moves value from 'from' to 'to' variable.
     * Example: move one two # 0001 0001 0002
     * @param {Number} i Index of current code line
     */
    function _move(i) {
        _vars[_code[i + 3]] = _vars[_code[i + 2]];
    }
    /**
     * inc command handler. Increments variable.
     * Example: inc one # 0002 0001
     * @param {Number} i Index of current code line
     */
    function _inc(i) {
        _vars[_code[i + 2]]++;
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
            var l = code.length;

            _code = code;
            //
            // All labels will be saved in _labels field
            //
            for (i = 0; i < l; i+=_MAX_LINE_SEGMENTS) {
                if (_code[i]) {_labels[_code[i]] = i;}
            }
            //
            // This is a main loop, where all commands are ran
            //
            i = 0;
            while (i < l) {
                i += (_cmds[code[i + 1]](i) || _MAX_LINE_SEGMENTS);
            }
        }
    };
})();