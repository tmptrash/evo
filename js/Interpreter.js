/**
 * @author DeadbraiN
 */
Evo.Interpreter = (function () {
    //
    // private section
    //

    /**
     * {Number} Amount of segments (parts) in one code line: label, keyword, argument, argument
     */
    var _MAX_LINE_SEGMENTS = 4;
    /**
     * {UInt16Array} Array of code to interpret
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
    /**
     * Collects all label names and indexes and stores in _labels field
     */
    function _collectLabels() {
        var i;
        var l = _code.length;

        for (i = 0; i < l; i+=_MAX_LINE_SEGMENTS) {
            if (_code[i]) {
                _labels[_code[i]] = i;
            }
        }
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
            if (!(code instanceof Uint16Array)) {
                return false;
            }

            var i = 0;
            var l = code.length;

            _code = code;
            //
            // All labels will be saved in _labels field
            //
            _collectLabels();
            //
            // This is a main loop, where all command are ran
            //
            while (i < l) {
                i += (_cmds[code[i + 1]](i) || _MAX_LINE_SEGMENTS);
            }
        }
    };
})();