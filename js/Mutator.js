/**
 * This module generates mutations for binary script of organism.
 * Mutations are random and accurate changes in code, which may
 * help it to pass the tests (see Evo.Data). From time to time
 * (randomly) Mutator may produce some extra command. This is
 * how our binary code is growing. It's important, that the
 * Mutator should produce pretty accurate code. It should
 * create correct commands and they arguments. It doesn't
 * understand code's meaning, but understand code format. Also
 * Mutator produces one way code. It means that it doesn't
 * contain infinite loops. Every jump command may produce
 * destination lines greater then current. It's important,
 * because impossible to resolve infinite loops in the script.
 *
 * Dependencies:
 *     Evo
 *
 * @author DeadbraiN
 */
Evo.Mutator = function Mutator() {
    /**
     * @constant
     * {Number} Max word number + 1. + 1 is needed for randomizer.
     */
    var _MAX_NUMBER_PLUS_ONE = Evo.MAX_NUMBER + 1;
    /**
     * @constant
     * {Number} Coefficient of new mutations. It means, that
     * it directly affects on binary script growing.
     */
    var _NEW_MUTATIONS_SPEED = Evo.NEW_MUTATIONS_SPEED;


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
        _echo,  // 14
        _or,    // 15
        _and,   // 16
        _xor,   // 17
        _not,   // 18
        _mul,   // 19
        _div,   // 20
        _rem,   // 21
        _shl,   // 22
        _shr,   // 23
        _in,    // 24
        _out,   // 25
        _step,  // 26
        _eat,   // 27
        _clone  // 28
    ];
    /**
     * {Number} Just amount of commands
     */
    var _cmdsAmount = _cmds.length;
    /**
     * {Number} Amount of code lines in current binary script
     */
    var _codeLen    = 0;
    /**
     * {Number} Amount of one code line segments. Like command, arg1, arg2, arg3
     */
    var _segs       = Evo.LINE_SEGMENTS;


    /**
     * Generates 'set' command with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _set(code, i) {
        //
        // +1 means that rare one new variable will be added
        //
        //noinspection JSCheckFunctionSignatures
        code.set([0, _floor(_rnd() * _MAX_NUMBER_PLUS_ONE), _floor(_rnd() * _varsLen), 0], i);
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
        code.set([8, (_floor(_rnd() * (_codeLen - i) / _segs) * _segs + i + _segs) || 1, 0, 0], i);
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
        code.set([9, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), _floor(_rnd() * (_codeLen - i) / _segs) * _segs + i + _segs], i);
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
        code.set([10, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), _floor(_rnd() * (_codeLen - i) / _segs) * _segs + i + _segs], i);
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
        code.set([11, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), _floor(_rnd() * (_codeLen - i) / _segs) * _segs + i + _segs], i);
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
        code.set([12, _floor(_rnd() * _varsLen), _floor(_rnd() * (_codeLen - i) / _segs) * _segs + i + _segs, 0], i);
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
        code.set([13, _floor(_rnd() * _varsLen), _floor(_rnd() * (_codeLen - i) / _segs) * _segs + i + _segs, 0], i);
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
    /**
     * Generates command 'or' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _or(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([15, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'and' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _and(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([16, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'xor' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _xor(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([17, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'not' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _not(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([18, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'mul' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _mul(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([19, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'div' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _div(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([20, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'rem' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _rem(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([21, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'shl' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _shl(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([22, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'shr' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _shr(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([23, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'in' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _in(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([24, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'out' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _out(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([25, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'step' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _step(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([26, _floor(_rnd() * _varsLen), 0, 0], i);
    }
    /**
     * Generates command 'eat' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _eat(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([27, _floor(_rnd() * _varsLen), _floor(_rnd() * _varsLen), 0], i);
    }
    /**
     * Generates command 'clone' with random arguments. This command may
     * be added to the end or in any script position, removing
     * previous command at this position.
     * @param {Uint16Array} code Script code in binary format
     * @param {Number} i Index of set command we need to mutate.
     */
    function _clone(code, i) {
        //noinspection JSCheckFunctionSignatures
        code.set([28, _floor(_rnd() * _varsLen), 0, 0], i);
    }


    return {
        /**
         * Makes one mutation in code. It means, that some code line will be
         * changed by random command and it's arguments.
         * @param {Uint16Array} code Script code in binary format
         * @param {Array} varsLen Amount of variables
         * @param {Number} codeLen
         * at the end of script
         */
        mutate: function (code, varsLen, codeLen) {
            var segs = _segs;

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
            if (_floor(_rnd() * codeLen * _NEW_MUTATIONS_SPEED) === 1 || !codeLen) {
                _cmds[_floor(_rnd() * _cmdsAmount)](code, codeLen);
                _codeLen += segs;
            } else {
                _cmds[_floor(_rnd() * _cmdsAmount)](code, _floor(_rnd() * (codeLen / segs)) * segs);
            }
        },
        /**
         * Returns amount of words (Uint16) in binary script
         * @returns {Number}
         */
        getCodeLen: function () {
            return _codeLen;
        }
    };
};