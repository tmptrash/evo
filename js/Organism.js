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

    // TODO: remove this
    /**
     * {Number} prevDist Distance of previous comparison
     * by Damerau-Levenshtein of output and current data set
     */
    var _prevCommon = 0;
    var _fromChCode = String.fromCharCode;

    function _goodMutation(out, data) {
        var outStr  = _fromChCode.apply(String, out);
        var dataStr = _fromChCode.apply(String, data);
        var common  = lcs(outStr, dataStr);
        var result  = common >= _prevCommon;

        if (_prevCommon < common) {
            _prevCommon = common;
        }

        return result;
    }


    /**
     * Returns amount of passed data sets.
     * @param {Array} out Output stream
     * @param {Array} data Data set
     * @return {Boolean}
     * @private
     */
    function _testPassed(out, data) {
        var outStr  = ',' + out.join(',') + ',';
        var dataStr = ',' + data.join(',') + ',';

        return outStr.indexOf(dataStr) !== -1;
    }
    /**
     * Prints a report about last mutations iteration. This report
     * means, that one more data set was processed and new script
     * was created for that. All previous data sets were also
     * processed correctly.
     * @param {Array} inData Input data for test
     * @param {Array} outData Output data for test
     * @param {Array} out Output stream of organism
     * @param {Number} runAmount Amount of script run
     */
    function _printReport(inData, outData, out, runAmount) {
        console.log('%cin[%s] out[%s] runs[%d] stream[%s]', 'color: ' + Evo.COLOR_DATA, inData + '', outData + '', runAmount, out + '');
        Evo.Organism.getCode('useConsole');
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
            var mem        = _mem  = new Uint16Array(maxNumber);
            var code       = _code = new Uint16Array(maxNumber);
            var out        = _out  = [];
            var mutate     = evoMutator.mutate.bind(evoMutator);
            var reset      = evoMutator.reset.bind(evoMutator);
            var rollback   = evoMutator.rollback.bind(evoMutator);
            var run        = evoInterpr.run.bind(evoInterpr);
            var getCodeLen = evoMutator.getCodeLen.bind(evoInterpr);
            var varsLen    = evoInterpr.VARS_AMOUNT;
            var data       = Evo.Data;
            var runAmount  = 0;
            var clever;
            var i;
            var d;
            var l;

            //
            // This loop checks if organism passes all data tests
            //
            for (d = 0, l = data.length; d < l; d += 2) {
                clever = false;
                //
                // This is a main loop. Here organism checks if
                // last mutation do the job: generates correct
                // output.
                //
                while (!clever) {
                    //
                    // Assume that after current mutation our organism is clever
                    //
                    clever = true;
                    mutate(code, varsLen, getCodeLen());
                    //
                    // This loop checks all previous data sets. They should be passed.
                    //
                    for (i = 0; i <= d; i += 2) {
                        //
                        // Output stream should be cleared for every new data set
                        //
                        out.length = 0;
                        //
                        // This is how we set initial value to the organism's memory.
                        // It should read this and put the result into the output stream.
                        //
                        mem.set(data[i], 0);
                        run(code, mem, out, getCodeLen());
                        runAmount++;
                        if (!_testPassed(out, data[i + 1])) {
                            //
                            // This condition turns on a capability to 'forget'
                            // reverting of invalid mutations from time to time.
                            // It's a rarely process and needed for slowly script
                            // size increasing
                            //
                            //if (floor(rnd() * getCodeLen()) !== 1) {
                            if (!_goodMutation(out, data[i + 1])) {
                                rollback(code);
                            }
                            clever = false;
                            break;
                        }
                    }
                    // TODO:
                    // We need to mutate our code only on case of some tests were failed
                    //
//                        if (!clever) {
//                            mutate(code, varsLen, getCodeLen());
//                        }
                }
                _printReport(data[d], data[d + 1], out, runAmount);
                runAmount = 0;
                //
                // It's important to do a reset od mutations here,
                // after success previous one. It's needed, because
                // in next iteration of main loop last (good) mutation
                // will be reverted by rollback() method.
                //
                //reset();
            }

            console.log('\n%cAll tests were done!', 'color: ' + Evo.COLOR_FINAL);
            //
            // This is how we finish running time measurement. See console.time()
            // call at the beginning of current method
            //
            console.timeEnd('running time');
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
        }
    };
})();