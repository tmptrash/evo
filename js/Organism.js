/**
 * TODO: describe how organism works: mutations, memory, input, output,...
 *
 * @author DeadbraiN
 */
Evo.Organism = (function () {
    /**
     * {Uint16Array} Binary code of the organism. This code will be
     * changed by Mutator module.
     */
    var _code = null;
    /**
     * {Uint16Array} Organism's internal memory. We use this memory
     * to set input data and check output in _out field.
     */
    var _mem  = null;
    /**
     * {Array} Output stream. Is used for output numbers from organism
     */
    var _out  = null;
    /**
     * {Number} Value of similarity. As big this value is
     * as much similar data set and output were.
     */
    var _prevDistance = 0;
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
     * Prints a report about last mutations iteration. This report
     * means, that one more data set was processed and new script
     * was created for that. All previous data sets were also
     * processed correctly.
     * @param {Array} inData Input data for test
     * @param {Array} outData Output data for test
     * @param {Array} out Output stream of organism
     */
    function _printReport(inData, outData, out) {
        console.log('%cin[%s] out[%s] runs[%d] stream[%s]', 'color: ' + Evo.COLOR_DATA, inData + '', outData + '', _curMutations, out + '');
        Evo.Organism.getCode('useConsole');
    }
    /**
     * This method is used for reallocation of memory, which is used
     * for binary code. After mutations script size is growing all the
     * time, so we need to allocate more memory for it.
     */
    function _reallocateCode() {
        var codeLen = Evo.Mutator.getCodeLen();
        var code    = new Uint16Array(codeLen + codeLen);

        code.set(_code, 0);
        _code = code;
        return codeLen + codeLen;
    }


    return {
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

            var maxNumber  = Evo.MAX_NUMBER;
            var evoMutator = Evo.Mutator;
            var evoInterpr = Evo.Interpreter;
            var mem        = new Uint16Array(maxNumber);
            var code       = new Uint16Array(maxNumber);
            var out        = [];
            var mutate     = evoMutator.mutate.bind(evoMutator);
            var rollback   = evoMutator.rollback.bind(evoMutator);
            var run        = evoInterpr.run.bind(evoInterpr);
            var getCodeLen = evoMutator.getCodeLen.bind(evoInterpr);
            var varsLen    = evoInterpr.VARS_AMOUNT;
            var data       = Evo.Data;
            var backAmount = Evo.BLOCKING_ITERATIONS;
            var d          = 0;
            var l          = data.length;
            var max;
            var distance;
            var clever;
            var len;
            var b;
            var i;

            _mem  = mem;
            _code = code;
            _out  = out;


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
                    //
                    // Assume that after current mutation our organism is clever
                    //
                    clever = true;
                    mutate(code, varsLen, getCodeLen());
                    _curMutations++;
                    len = getCodeLen();
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
                    // TODO: this loop a little bit incorrect. It should
                    // TODO: use order of sequence from every data set
                    for (i = distance = max = 0; i <= d; i += 2) {
                        //
                        // Output stream should be cleared for every new data set
                        //
                        out.length = 0;
                        //
                        // This is how we set initial value to the organism's memory.
                        // It should read this and put the result into the output stream.
                        //
                        mem.set(data[i], 0);
                        run(code, mem, out, len);
                        distance += lcs(_fromChCode.apply(String, out), _fromChCode.apply(String, data[i + 1]));
                        max      += data[i + 1].length;
                    }
                    //
                    // All tests (data sets) were passed
                    //
                    if (distance === max) {
                        _prevDistance = distance;
                        break;
                    }
                    //
                    // If previous mutation has passed more tests (data sets),
                    // then we need to revert current one.
                    //
                    clever = false;
                    if (_prevDistance > distance) {
                        rollback(code);
                        continue;
                    }
                    _prevDistance = distance;
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
                        console.log('\n%cAll tests were done!', 'color: ' + Evo.COLOR_FINAL);
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
         * false to return binary code. 'useConsole' to show code using console.log() and
         * without return value. 'noLines' to show code without line numbers. It's possible
         * to combine these parameters like this: 'useConsole, noLines'
         * @param {Number=} padWidth Width in symbols for every code segment
         * @returns {Uint16Array|String} Final generated binary script of organism
         */
        getCode: function (skipFormat, padWidth) {
            var c2t  = Evo.Code2Text;
            var code = new Uint16Array(_code.subarray(0, Evo.Interpreter.getCodeLen()));

            padWidth = padWidth || Evo.CODE_PADDING;

            if (skipFormat === true || skipFormat === undefined) {
                return code;
            }
            if (skipFormat.indexOf('useConsole') !== -1) {
                console.log('%c' + c2t.format(c2t.convert(code), padWidth, skipFormat.indexOf('noLines') !== -1), 'color: ' + Evo.COLOR_CODE);
                return undefined;
            }

            return c2t.format(c2t.convert(code), padWidth, skipFormat.indexOf('noLines') !== -1);
        },
        /**
         * Returns memory dump of organism
         * @returns {Uint16Array}
         */
        getMemory: function () {
            return new Uint16Array(_mem);
        },
        /**
         * Returns output stream of organism. It uses echo command for output.
         * This method creates a copy of output array to prevent it's modification
         * from outside.
         * @returns {Array}
         */
        getOutput: function () {
            return _out.slice(0);
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
         * updated only between data sets.
         * @return {Number}
         */
        getAllMutations: function() {
            return _allMutations + _curMutations;
        }
    };
})();