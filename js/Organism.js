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
     * Returns amount of passed data sets.
     * @param {Array} out Output stream
     * @param {Array} data Data set
     * @param {Number} i Index of current data set
     * @return {Boolean}
     * @private
     */
    function _testPassed(out, data, i) {
        var outStr  = ',' + out.join(',') + ',';
        var dataStr = ',' + data[i + 1].join(',') + ',';

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
     * @param {Uint16Array} code Current binary script
     * @param {Number} len Length of binary script
     */
    function _printReport(inData, outData, out, code, len) {
        console.log('in [%s] out [%s] stream [%s]', inData + '', outData + '', out + '');
        //
        // TODO: here should be a converter from binary script to readable assembler
        //
        console.log('Scr:', code.subarray(0, len));
    }


    return {
        /**
         * TODO: describe logic about: mutation -> prev. data checks -> revert -> loop
         * Starts organism to leave on. Live means pass all data sets (tests) by
         * finding specific binary script obtained by mutations.
         */
        live: function () {
            var maxNumber  = Evo.MAX_NUMBER;
            var evoMutator = Evo.Mutator;
            var evoInterpr = Evo.Interpreter;
            var mem        = _mem  = new Uint16Array(maxNumber);
            var code       = _code = new Uint16Array(maxNumber);
            var out        = _out  = [];
            var mutate     = evoMutator.mutate.bind(evoMutator);
            var rollback   = evoMutator.rollback.bind(evoMutator);
            var analyze    = evoInterpr.analyze.bind(evoInterpr);
            var run        = evoInterpr.run.bind(evoInterpr);
            var getCodeLen = evoInterpr.getCodeLen.bind(evoInterpr);
            var getVarsLen = evoInterpr.getVarsLen.bind(evoInterpr);
            var data       = Evo.Data;
            var floor      = Math.floor;
            var rnd        = Math.random;
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
                // TODO: Think about ability to get state of organism:
                // TODO: memory dump, code text and so on.
                //
                while (!clever) {
                //for (var k = 0; k < 1000; k++) {
                    mutate(code, getVarsLen(), getCodeLen());
                    //
                    // Assume that after current mutation our organism is clever
                    //
                    clever = true;
                    //
                    // This loop checks all previous data sets. They should be passed.
                    //
                    for (i = 0; i <= d; i += 2) {
                        //
                        // Output stream should be cleared for every new data set
                        //
                        out = [];
                        //
                        // This is how we set initial value to the organism's memory.
                        // It should read this and put the result into the output stream.
                        //
                        mem.set(data[i], 0);
                        run(code, mem, out);
                        if (!_testPassed(out, data, i)) {
                            //
                            // This condition turns on a capability to 'forget'
                            // reverting of invalid mutations. It's a rarely process
                            // and needed for slowly script size increasing
                            //
                            if (floor(rnd() * getCodeLen()) !== 1) {
                                rollback(code);
                                //
                                // We need to analyze (not run) our code to update
                                // internal fields: varsLens, codeLen,...
                                //
                                analyze(code, mem, out);
                            }
                            clever = false;
                            break;
                        }
                    }
                }
                _printReport(data[d], data[d + 1], out, code, getCodeLen());
            }

            console.log('All tests were done!');
        },
        /**
         * Returns organism's code.
         * @returns {Uint16Array} Final generated binary script of organism
         */
        getCode: function () {
            return new Uint16Array(_code.subarray(0, Evo.Interpreter.getCodeLen()));
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
         * @returns {Array}
         */
        getOutput: function () {
            return _out;
        }
    };
})();