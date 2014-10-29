/**
 * TODO: describe how organism works: mutations, memory, input, output,...
 *
 * @author DeadbraiN
 */
Evo.Organism = (function () {
    /**
     * Returns amount of passed data sets.
     * @param {Array} out Output stream
     * @param {Array} data Data set
     * @param {Number} i Index of current data set
     * @return {Boolean}
     * @private
     */
    function _getPassed(out, data, i) {
        return out.join(',').indexOf(data[i].join(',')) !== -1;
    }
    /**
     * Prints a report about last mutations iteration. This report
     * means, that one more data set was processed and new script
     * was created for that. All previous data sets were also
     * processed correctly.
     * @param {Array} out Output stream
     * @param {Uint16Array} code Current binary script
     * @param {Number} len Length of binary script
     */
    function _printReport(out, code, len) {
        console.log('Output stream:', out);
        //
        // TODO: here should be a converter from binary script to readable assembler
        //
        console.log('Generated script:', code.subarray(0, len));
    }


    return {
        /**
         * TODO: describe logic about: mutation -> prev. data checks -> revert -> loop
         * Starts organism to leave on
         */
        live: function () {
            var mem        = new Uint16Array(Evo.MAX_NUMBER);
            var code       = new Uint16Array(Evo.MAX_NUMBER);
            var out        = [];
            var mutate     = Evo.Mutator.mutate.bind(Evo.Mutator);
            var rollback   = Evo.Mutator.rollback.bind(Evo.Mutator);
            var analyze    = Evo.Interpreter.analyze.bind(Evo.Interpreter);
            var run        = Evo.Interpreter.run.bind(Evo.Interpreter);
            var getLabels  = Evo.Interpreter.getLabels.bind(Evo.Interpreter);
            var getLength  = Evo.Interpreter.getLength.bind(Evo.Interpreter);
            var getVarsLen = Evo.Interpreter.getVarsLen.bind(Evo.Interpreter);
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
                    mutate(code, getLabels(), getVarsLen(), getLength());
                    //
                    // Assume that after current mutation our organism is clever
                    //
                    clever = true;
                    //
                    // This loop checks all previous data sets. They should be passed.
                    //
                    for (i = 0; i <= d; i += 2) {
                        //
                        // This is how we set initial value to the organism's memory.
                        // It should read this and put the result into the output stream.
                        //
                        mem.set(data[i], 0);
                        run(code, mem, out);
                        if (!_getPassed(out, data, i)) {
                            //
                            // This condition turns on a capability to 'forget'
                            // reverting of invalid mutations. It's a rarely process
                            // and needed for slowly script size increasing
                            //
                            if (floor(rnd() * getLength()) !== 1) {
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
                _printReport(out, code, getLength());
                //
                // Output stream should be cleared for every new data set
                //
                out = [];
            }

            console.log('All tests were done!');
        }
    };
})();