/**
 * TODO: describe this module: mutations, random generator,
 * TODO: accurate mutations (only correct commands and it's
 * TODO: parameters may be generated).
 * TODO: Add examples of command for all generators like _set, _move,...
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
     * {Number} Amount of labels in binary script
     */
    var _labelsLen = null;
    /**
     * {Number} Amount of variables
     */
    var _varsLen = null;
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
     * Returns new generated label id or 0 if no label
     * @return {Number}
     */
    function _createLabel() {
        //
        // This formula means random boolean number 0 or 1
        //
        return _floor(_rnd() * 2) ? _labelsLen || 1 : 0;
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
        //
        // +1 means that rare one new variable will be added
        //
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 0, _createNumber(), _floor(_rnd() * _varsLen) + 1, 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 1, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 2, _floor(_rnd() * _varsLen), 0, 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 3, _floor(_rnd() * _varsLen), 0, 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 4, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 5, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 6, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 7, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 8, _floor(_rnd() * _varsLen), 0, 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 9, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), _floor(_rnd() * _labelsLen)], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 10, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), _floor(_rnd() * _labelsLen)], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 11, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), _floor(_rnd() * _labelsLen)], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 12, _floor(_rnd() * _varsLen), _floor(_rnd() * _labelsLen), 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 13, _floor(_rnd() * _varsLen), _floor(_rnd() * _labelsLen), 0], i === null ? _codeLen : i);
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
        //noinspection JSCheckFunctionSignatures
        code.set([_createLabel(), 14, _floor(_rnd() * _varsLen), 0, 0], i === null ? _codeLen : i);
    }


    return {
        /**
         * Makes one mutation in code
         * @param {Uint16Array} code Script code in binary format
         * @param {Object} labels Labels map
         * @param {Array} varsLen Amount of variables
         * @param {Number} codeLen
         * Segments are: label, command, arguments,...
         */
        mutate: function (code, labels, varsLen, codeLen) {
            var segs = Evo.LINE_SEGMENTS;
            //
            // This labels map will be used for generating new unique label ids
            //
            _labelsLen = _keys(labels).length;
            _codeLen   = codeLen;
            _varsLen   = varsLen;

            //
            // This check means that we need to generate new command or mutate
            // existing. New command will be added as are as more command we
            // already have. Note, that every time we need to create new Uint16Array
            // we must create new Uint16Array instance, because subarray() method
            // returns not a copy, but reference to array part. So you may change
            // one array by changing other one.
            //
            // TODO: we need to check if code array is full and reallocate it's size * 2
            if (_floor(_rnd() * codeLen) === 1 || !codeLen) {
                _lastIndex = _codeLen;
                _lastLine = new Uint16Array(code.subarray(_lastIndex, _lastIndex + segs));
                _cmds[_floor(_rnd() * _cmdsAmount)](code, null);
                _codeLen += segs;
            } else {
                //
                // Old binary script line should be saved in temp array _lastLine.
                // It will be used for rollback.
                //
                _lastIndex = _floor(_rnd() * (codeLen / segs)) * segs;
                _lastLine = new Uint16Array(code.subarray(_lastIndex, _lastIndex + segs));
                _cmds[_floor(_rnd() * _cmdsAmount)](code, _lastIndex);
            }
        },

        /**
         * Rollbacks last mutation
         * @param {Uint16Array} code Script code in binary format
         */
        rollback: function (code) {
            code.set(_lastLine, _lastIndex);
        }
    };
})();
