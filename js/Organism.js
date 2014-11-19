/**
 * TODO: describe how organism works: mutations, memory, input, output,...
 * TODO: Add default values for config parameters
 *
 * @param {Object} config          Start configuration of the organism
 *        {Array}  data            Input and output data for organism
 *        {String} colorData       Color of text for obtained organism's output data
 *        {String} colorCode       Color of the text script
 *        {Number} maxNumber       Maximum available number in script
 *        {Number} blockIterations Amount of iterations, which will be run in background without breaking
 *        {Number} memSize         Organism's memory size in words (2 * memSize byte)
 *        {Number} codePadding     Padding of text code for every column: command, arg1, arg2, arg3
 *
 * Dependencies:
 *     Evo
 *     Evo.Mutator
 *     Evo.Code2Text
 *     Evo.Interpreter
 *
 * @author DeadbraiN
 */
Evo.Organism = function (config) {
    /**
     * {Uint16Array} Binary code of the organism. This code will be
     * changed by Mutator module.
     */
    var _code = null;
    /**
     * {Number} Value of similarity. As big this value is
     * as much similar data set and output were.
     */
    var _prevDistance = new Uint32Array(config.data.length / 2);
    /**
     * {Function} Just a shortcut for fromCharCode(). I used for
     * performance issue.
     */
    var _fromChCode = String.fromCharCode;
    /**
     * {Number} Amount of mutations for current data set. It is
     * reset every time, then new data set has handled.
     */
    var _curMutations = 0;
    /**
     * {Number} Total amount of all mutations from the beginning
     */
    var _allMutations = 0;
    /**
     * {Array} Reference to last data set, which was passed or not.
     * It's used for obtaining memory, output and variables of organism.
     */
    var _lastData = null;
    /**
     * {Evo.Mutator} Personal mutator instance. It's uses for binary
     * code mutation.
     */
    var _mutator = new Evo.Mutator();
    /**
     * {Evo.Interpreter} An interpreter for binary script
     */
    var _interpreter = new Evo.Interpreter();
    /**
     * {Evo.Organism} Is used in private methods, because this is
     * points to the windows object.
     */
    var _me = null;


    /**
     * Prints a report about last mutations iteration. This report
     * means, that one more data set was processed and new script
     * was created for that. All previous data sets were also
     * processed correctly.
     * @param {Array} inData Input data for test
     * @param {Array} outData Output data for test
     * @param {Array} out Output stream of organism
     */
    function _printReport(inData, outData, out) {
        var code = _me.getCode();
        var i;
        var l;
        var l1;
        var s = '';

        for (i = 0, l = code.length, l1 = l -1; i < l; i++) {
            s += (code[i] + (i < l1 ? ',' : ''));
        }

        console.log('%cinp[%s]\nout[%s]\nrun[%d]\nsay[%s]\nbin[%s]', 'color: ' + config.colorData, inData + '', outData + '', _curMutations, out + '', s);
        _me.getCode('text');
    }
    /**
     * This method is used for reallocation of memory, which is used
     * for binary code. After mutations script size is growing all the
     * time, so we need to allocate more memory for it.
     */
    function _reallocateCode() {
        var codeLen = _mutator.getCodeLen();
        var code    = new Uint16Array(codeLen + codeLen);

        code.set(_code, 0);
        _code = code;
        return codeLen + codeLen;
    }


    return (_me = {
        /**
         * TODO: describe logic about: mutation -> prev. data checks -> revert -> loop
         * Starts organism to leave on. Live means pass all data sets (tests) by
         * finding specific binary script obtained by mutations.
         */
        live: function () {
            //
            // This is how we start running time measurement
            //
            console.time('running time');

            var maxNumber  = config.maxNumber;
            var backAmount = config.blockIterations;
            var mem        = new Uint16Array(config.memSize);
            var zeroMem    = new Uint16Array(config.memSize);
            var code       = new Uint16Array(maxNumber);
            var out        = [];
            var varsLen    = _interpreter.VARS_AMOUNT;
            var data       = config.data;
            var d          = 0;
            var l          = data.length;
            var similar    = lcs;
            var distance   = new Uint32Array(l / 2);
            var zeroDist   = new Uint32Array(l / 2);
            var passed     = 0;
            var clever;
            var len;
            var b;
            var i;
            var i2;

            _code = code;


            /**
             * This method calls as a background thread. As you know
             * JavaScript doesn't support multithreading. So we need to
             * use setTimeout() for this. As a result we may type different
             * commands in console, while organism is leaving.
             */
            function doInBackground() {
                clever = false;
                b      = 0;
                //
                // This is a main loop. Here organism checks if
                // last mutation do the job: generates correct
                // output.
                //
                while (!clever && b++ < backAmount) {
                    _mutator.mutate(code, varsLen, _mutator.getCodeLen());
                    _curMutations++;
                    len    = _mutator.getCodeLen();
                    distance.set(zeroDist, 0);
                    //
                    // When all allocated memory for binary script is reached, we need
                    // to reallocate it new bigger size.
                    //
                    if (len === maxNumber) {
                        maxNumber = _reallocateCode();
                        code      = _code;
                    }
                    //
                    // This loop checks all previous data sets. They should be passed.
                    // If current mutation is better then previous, then distance will
                    // be greater then _prevDistance.
                    //
                    for (i = i2 = passed = 0; i <= d; i += 2, i2++) {
                        //
                        // Output stream should be cleared for every new data set
                        //
                        out.length = 0;
                        _lastData  = data[i];
                        //
                        // This is how we set initial value to the organism's memory.
                        // It should read this and put the result into the output stream.
                        //
                        mem.set(zeroMem, 0);
                        mem.set(_lastData, 0);
                        _interpreter.run(code, mem, out, len);
                        distance[i2] = similar(_fromChCode.apply(String, out), _fromChCode.apply(String, data[i + 1]));
                        //
                        // It was bad mutation and we need to revert it
                        //
                        if (distance[i2] < _prevDistance[i2]) {
                            _mutator.rollback(code);
                            break;
                        }
                        //
                        // This test was passed
                        //
                        else if (distance[i2] === data[i + 1].length) {passed++;}
                        //
                        // Last mutation was greater then previous
                        //
                        else if (distance[i2] > _prevDistance[i2]) {
                            _prevDistance.set(distance, 0);
                            break;
                        }
                    }
                    clever = false;
                    if (passed === d / 2 + 1) {
                        clever = true;
                        _prevDistance.set(distance, 0);
                        break;
                    }
                }

                if (clever) {
                    _printReport(data[d], data[d + 1], out);
                    _allMutations += _curMutations;
                    _curMutations = 0;
                    //
                    // This is how we simulate the loop though data sets
                    //
                    d += 2;
                    //
                    // If this condition is true, then all data sets have done
                    //
                    if (d >= l) {
                        //
                        // This is how we finish running time measurement. See console.time()
                        // call at the beginning of current method
                        //
                        console.timeEnd('running time');
                        return;
                    }
                }
                setTimeout(doInBackground, 0);
            }

            _allMutations = _curMutations = 0;
            //
            // This is an entry point of living process.
            // All other looping will be in background
            // and used may type different commands
            //
            setTimeout(doInBackground, 0);
        },
        /**
         * Returns organism's code in different formats. This method may contain unoptimized
         * code, because it's used rare.
         * @param {String|Boolean=} skipFormat true to return formatted human readable code,
         * false to return binary code. 'text' to show code using console.log() and
         * without return value. 'textNoLines' to show code without line numbers. It's possible
         * to combine these parameters like this: 'text, textNoLines'
         * @param {Number=} padWidth Width in symbols for every code segment
         * @returns {Uint16Array|String} Final generated binary script of organism
         */
        getCode: function (skipFormat, padWidth) {
            var c2t  = Evo.Code2Text;
            //
            // We need to exclude an ability to create a reference to the
            // binary code, because organism is leaving now and mutator
            // is changing binary code right now. So our changing of this
            // code here may affect it in organism.
            //
            var code = new Uint16Array(_code.subarray(0, _interpreter.getCodeLen()));

            padWidth = padWidth || config.codePadding;

            if (skipFormat === true || skipFormat === undefined) {
                return code;
            }
            if (skipFormat.indexOf('text') !== -1) {
                console.log('%c' + c2t.format(c2t.convert(code), padWidth, skipFormat.indexOf('textNoLines') !== -1), 'color: ' + config.colorCode);
                return undefined;
            }

            return c2t.format(c2t.convert(code), padWidth, skipFormat.indexOf('textNoLines') !== -1);
        },
        /**
         * Returns memory dump of organism according to actual binary script. It's
         * important, that we use a copy of the memory and not it's original one.
         * @returns {Uint16Array}
         */
        getMemory: function () {
            var mem = new Uint16Array(config.maxNumber);
            var out = [];

            mem.set(_lastData, 0);
            _interpreter.run(_code, mem, out, _interpreter.getCodeLen());

            return mem;
        },
        /**
         * Returns output stream of organism. It uses echo command for output.
         * This method creates a copy of output array to prevent it's modification
         * from outside.
         * @returns {Array}
         */
        getOutput: function () {
            var mem = new Uint16Array(config.maxNumber);
            var out = [];

            mem.set(_lastData, 0);
            _interpreter.run(_code, mem, out, _interpreter.getCodeLen());

            return out;
        },
        /**
         * Returns amount of mutations for current data set. This parameter is reset
         * for every new data set in Evo.Data.
         * @return {Number}
         */
        getMutations: function() {
            return _curMutations;
        },
        /**
         * Returns amount of all mutations of organism from the beginning of leaving.
         * We need to add all mutations and current, because all mutations field is
         * updated only between data sets are passed.
         * @return {Number}
         */
        getAllMutations: function() {
            return _allMutations + _curMutations;
        }
    });
};