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
    var _MAX_NUMBER_PLUS_ONE = Evo.MAX_NUMBER + 1;
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
        _dec,   // 3
        _add,   // 4
        _sub,   // 5
        _read,  // 6
        _write, // 7
        _jump,  // 8
        _jumpg, // 9
        _jumpl, // 10
        _jumpe, // 11
        _jumpz, // 12
        _jumpn, // 13
        _echo   // 14
    ];
    /**
     * {Number} Just amount of commands
     */
    var _cmdsAmount = _cmds.length;
    /**
     * {Number} Amount of code lines in current binary script
     */
    var _codeLen = null;
    /**
     * {Array} Binary script code line, before mutation. It's
     * used for reverting.
     */
    var _lastLine = [];
    /**
     * {Number} Index of last mutated binary script line
     */
    var _lastIndex = 0;
    /**
     * {Boolean} Sets to true if mutation method has added new
     * line at the end of binary script.
     */
    var _atTheEnd = false;


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
     * Create number randomly in range [0..._MAX_NUMBER]
     * @return {Number}
     */
    function _createNumber() {
        return _floor(_rnd() * _MAX_NUMBER_PLUS_ONE);
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
        code.set([_createLabel(), 3, _createNumber(), 0, 0], i || _codeLen);
    }
    /**
     * Generates command 'add' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _add(code, i) {
        code.set([_createLabel(), 4, _createNumber(), _createNumber(), 0], i || _codeLen);
    }
    /**
     * Generates command 'sub' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _sub(code, i) {
        code.set([_createLabel(), 5, _createNumber(), _createNumber(), 0], i || _codeLen);
    }
    /**
     * Generates command 'read' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _read(code, i) {
        code.set([_createLabel(), 6, _createNumber(), _createNumber(), 0], i || _codeLen);
    }
    /**
     * Generates command 'write' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _write(code, i) {
        code.set([_createLabel(), 7, _createNumber(), _createNumber(), 0], i || _codeLen);
    }
    /**
     * Generates command 'jump' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _jump(code, i) {
        code.set([_createLabel(), 8, _createNumber(), 0, 0], i || _codeLen);
    }
    /**
     * Generates command 'jumpg' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _jumpg(code, i) {
        code.set([_createLabel(), 9, _createNumber(), _createNumber(), _createNumber()], i || _codeLen);
    }
    /**
     * Generates command 'jumpl' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _jumpl(code, i) {
        code.set([_createLabel(), 10, _createNumber(), _createNumber(), _createNumber()], i || _codeLen);
    }
    /**
     * Generates command 'jumpg' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _jumpe(code, i) {
        code.set([_createLabel(), 11, _createNumber(), _createNumber(), _createNumber()], i || _codeLen);
    }
    /**
     * Generates command 'jumpz' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _jumpz(code, i) {
        code.set([_createLabel(), 12, _createNumber(), _createNumber(), 0], i || _codeLen);
    }
    /**
     * Generates command 'jumpn' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _jumpn(code, i) {
        code.set([_createLabel(), 13, _createNumber(), _createNumber(), 0], i || _codeLen);
    }
    /**
     * Generates command 'echo' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     * If this index is equal to null then new set command
     * should be created. Otherwise (i !== null) existing set command
     * will be mutated.
     * @private
     */
    function _echo(code, i) {
        code.set([_createLabel(), 14, _createNumber(), 0, 0], i || _codeLen);
    }


    return {
        /**
         * Makes one mutation in code
         * @param {Uint16Array} code Script code in binary format
         * @param {Object} labels Labels map
         * @param {Number} codeLen
         * Segments are: label, command, arguments,...
         */
        mutate: function (code, labels, codeLen) {
            var segs = Evo.LINE_SEGMENTS;
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
                _atTheEnd = true;
                _cmds[_floor(_rnd() * _cmdsAmount)](code, null);
            } else {
                //
                // Old binary script line should be saved in temp array _lastLine.
                // It will be used for rollback.
                //
                _lastIndex = _floor(_rnd() * (codeLen / segs)) * segs;
                _lastLine = code.subarray(_lastIndex, segs);
                _cmds[_floor(_rnd() * _cmdsAmount)](code, _lastIndex);
            }
        },

        /**
         * Rollbacks last mutation
         * @param {Uint16Array} code Script code in binary format
         */
        rollback: function (code) {
            var segs  = Evo.LINE_SEGMENTS;
            var empty = [];
            var i;
            var l;

            if (_atTheEnd) {
                for (i = 0, l = segs; i < l; i++) {empty[i] = 0;}
                code.set(empty, _codeLen - segs);
            } else {
                code.set(_lastLine, _lastIndex);
            }
        }
    };
})();
