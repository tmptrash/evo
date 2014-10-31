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
     * {Number} Max word number + 1. + 1 is needed for randomizer.
     */
    var _MAX_NUMBER_PLUS_ONE = Evo.MAX_NUMBER + 1;
    /**
     * {Function} Math.floor() method shortcut
     * @type {Function}
     * @private
     */
    var _floor      = Math.floor;
    /**
     * {Function} MAth.random() method shortcut
     */
    var _rnd        = Math.random;
    /**
     * {Number} Amount of variables
     */
    var _varsLen    = null;
    /**
     * {Array} All available mutations, which will be used
     * for random generator.
     */
    var _cmds       = [
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
    var _codeLen    = null;
    /**
     * {Array} Binary script code line, before mutation. It's
     * used for reverting.
     */
    var _lastLine   = [];
    /**
     * {Number} Index of last mutated binary script line
     */
    var _lastIndex  = 0;
    /**
     * {Number} Amount of one code line segments. Like command, arg1, arg2, arg3
     */
    var _segs       = Evo.LINE_SEGMENTS;


    /**
     * Generates 'set' command with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position. Only this method may create new
     * variables (new indexes).
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _set(code, i) {
        //
        // +1 means that rare one new variable will be added
        //
        //noinspection JSCheckFunctionSignatures
        code.set([0, _floor(_rnd() * _MAX_NUMBER_PLUS_ONE), _floor(_rnd() * _varsLen) + 1, 0], i);
    }
    /**
     * Generates command 'move' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _move(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([1, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'inc' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _inc(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([2, _floor(_rnd() * _varsLen), 0, 0], i);
    }
    /**
     * Generates command 'dec' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _dec(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([3, _floor(_rnd() * _varsLen), 0, 0], i);
    }
    /**
     * Generates command 'add' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _add(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([4, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'sub' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _sub(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([5, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'read' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _read(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([6, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'write' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _write(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([7, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'jump' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _jump(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([8, _floor(_rnd() * _varsLen), 0, 0], i);
    }
    /**
     * Generates command 'jumpg' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _jumpg(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([9, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), _floor(_rnd() * (_codeLen - i) / _segs) * _segs + i], i);
    }
    /**
     * Generates command 'jumpl' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _jumpl(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([10, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), _floor(_rnd() * (_codeLen - i) / _segs) * _segs + i], i);
    }
    /**
     * Generates command 'jumpg' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _jumpe(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([11, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), _floor(_rnd() * (_codeLen - i) / _segs) * _segs + i], i);
    }
    /**
     * Generates command 'jumpz' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _jumpz(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([12, _floor(_rnd() * _varsLen), _floor(_rnd() * (_codeLen - i) / _segs) * _segs + i, 0], i);
    }
    /**
     * Generates command 'jumpn' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _jumpn(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([13, _floor(_rnd() * _varsLen), _floor(_rnd() * (_codeLen - i) / _segs) * _segs + i, 0], i);
    }
    /**
     * Generates command 'echo' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _echo(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([14, _floor(_rnd() * _varsLen), 0, 0], i);
    }


    return {
        /**
         * Makes one mutation in code. It means, that some code line will be
         * changed by random command and it's arguments.
         * @param {Uint16Array} code Script code in binary format
         * @param {Array} varsLen Amount of variables
         * @param {Number} codeLen
         */
        mutate: function (code, varsLen, codeLen) {
            var segs = Evo.LINE_SEGMENTS;

            _codeLen = codeLen;
            _varsLen = varsLen;
            //
            // This check means that we need to generate new command or mutate
            // existing. New command will be added as rare as more command we
            // already have. Note, that every time we need to create new Uint16Array
            // we must create new Uint16Array instance, because subarray() method
            // returns not a copy, but reference to array part. So you may change
            // one array by changing other one.
            //
            // TODO: we need to check if code array is full and reallocate it's size * 2
            if (_floor(_rnd() * codeLen) === 1 || !codeLen) {
                _lastIndex = _codeLen;
                _lastLine = new Uint16Array(code.subarray(_lastIndex, _lastIndex + segs));
                _cmds[_floor(_rnd() * _cmdsAmount)](code, _lastIndex);
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
         * Rollbacks last mutation created by mutate() method.
         * @param {Uint16Array} code Script code in binary format
         */
        rollback: function (code) {
            //noinspection JSCheckFunctionSignatures
            code.set(_lastLine, _lastIndex);
        }
    };
})();