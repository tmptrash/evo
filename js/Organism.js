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
     * @param {Number} passed Amount of passed data sets on previous iteration
     * @return {Number}
     * @private
     */
    function _getPassed(out, data, i, passed) {
        var d;
        var dl;

        for (d = 0, dl = data.length; d <= i; d += 2) {

        }
        return out[0] === 1;
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
         * Starts organism to leave on
         */
        live: function () {
            var mem       = new Uint16Array(Evo.MAX_NUMBER);
            var code      = new Uint16Array(Evo.MAX_NUMBER);
            var out       = [];
            var mutate    = Evo.Mutator.mutate;
            var rollback  = Evo.Mutator.rollback;
            var run       = Evo.Interpreter.run;
            var getLabels = Evo.Interpreter.getLabels;
            var getLength = Evo.Interpreter.getLength;
            var data      = Evo.Data;
            var passed;
            var oldPassed = 0;
            var d;
            var dl;

            for (d = 0, dl = data.length; d < dl; d += 2) {
                //
                // This is a main loop. Here organism checks if
                // last mutation do the job: generates correct
                // output.
                //
                // TODO: Think about ability to get state of organism:
                // TODO: memory dump, code text and so on.
                //
                for (var i = 0; i < 1000; i++) {
                    mutate(code, getLabels(), getLength());
                    //
                    // This is how we set initial value to the organism's memory.
                    // It should read this and put the result into the output stream.
                    //
                    mem.set(data[d], 0);
                    run(code, mem, out);

                    passed = _getPassed(out, data, d, oldPassed);
                    if (passed <= oldPassed) {
                        rollback(code);
                        break;
                    }
                    oldPassed = passed;
                }
                _printReport(out, code, getLength());
                //
                // Output stream should be cleared for every new data set
                //
                out = [];
            }
        }
    };
})();