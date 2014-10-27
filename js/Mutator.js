/**
 * TODO: describe this module: mutations, random generator,
 * TODO: accurate mutations (only correct commands and it's
 * TODO: parameters may be generated).
 *
 * @author DeadbraiN
 */
Evo.Mutator = (function () {
    /**
     * {Number} Max word number + 1
     */
    var _MAX_NUMBER = 65536;
    /**
     * {Function} Object.keys method shortcut
     */
    var _keys = Object.keys;
    /**
     * {Function} Math.floor() method shortcut
     * @type {Function}
     * @private
     */
    var _floor = Math.floor;
    /**
     * {Function} MAth.random() method shortcut
     */
    var _rnd = Math.random;
    /**
     * {Object} map of labels. Key - label id, value - it's script index
     */
    var _labels = null;
    /**
     * {Array} All available mutations, which will be used
     * for random generator.
     */
    var _cmds = [
        _set,   // 0
        _move,  // 1
        _inc,   // 2
        _dec   // 3
//        _add,   // 4
//        _sub,   // 5
//        _read,  // 6
//        _write, // 7
//        _jump,  // 8
//        _jumpg, // 9
//        _jumpl, // 10
//        _jumpe, // 11
//        _jumpz, // 12
//        _jumpn, // 13
//        _echo   // 14
    ];
    /**
     * {Number} Just amount of commands
     */
    var _cmdsAmount = _cmds.length;
    /**
     * {Number} Amount of code lines in current binary script
     */
    var _codeLen    = null;


    /**
     * Returns new generated label id or 0 if no label
     * @return {Number}
     */
    function _createLabel() {
        //
        // This formula means random boolean number 0 or 1
        //
        return _floor(_rnd() * 2) ? _keys(_labels).length : 0;
    }

    /**
     * Create number randomly in range [0...65535]
     * @return {Number}
     */
    function _createNumber() {
        return _floor(_rnd() * _MAX_NUMBER);
    }
    /**
     * Generates command 'set' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _set(code, i) {
        code.set([_createLabel(), 0, _createNumber(), _createNumber(), 0], i || _codeLen);
    }
    /**
     * Generates command 'move' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _move(code, i) {
        code.set([_createLabel(), 1, _createNumber(), _createNumber(), 0], i || _codeLen);
    }
    /**
     * Generates command 'inc' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _inc(code, i) {
        code.set([_createLabel(), 2, _createNumber(), 0, 0], i || _codeLen);
    }
    /**
     * Generates command 'dec' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _dec(code, i) {
        code.set([_createLabel(), 2, _createNumber(), 0, 0], i || _codeLen);
    }


    return {
        /**
         * Makes one mutation in code
         * @param {Uint16Array} code Script code in binary format
         * @param {Object} labels Labels map
         * @param {Number} codeLen
         * @param {Number} segs  Amount of segments in one line.
         * Segments are: label, command, arguments,...
         */
        mutate: function (code, labels, codeLen, segs) {
            //
            // This labels map will be used for generating new unique label ids
            //
            _labels  = labels;
            _codeLen = codeLen;

            //
            // This check means that we need to generate new command or mutate
            // existing. New command will be added as are as more command we
            // already have.
            //
            // TODO: we need to check if code array is full and reallocate it's size * 2
            if (_floor(_rnd() * codeLen) === 1 || !codeLen) {
                _cmds[_floor(_rnd() * _cmdsAmount)](code, null);
            } else {
                _cmds[_floor(_rnd() * _cmdsAmount)](code, _floor(_rnd() * (codeLen / segs)) * segs);
            }
        }
    };
})();
