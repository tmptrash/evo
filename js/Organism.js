/**
 * TODO: describe how organism works: mutations, memory, input, output,...
 *
 * @author DeadbraiN
 */
Evo.Organism = (function () {
    /**
     * Checks if last mutation generates correct output
     * @param {Array} out Output stream
     * @private
     */
    function _correctOutput(out) {
        // TODO: this is temporary code
        if (out.length) {
            console.log(out);
        }
        return out[0] === 1;
    }


    return {
        /**
         * Starts organism to leave on
         */
        live: function () {
            //
            // TODO: These values should be obtained from config
            //
            var mem       = new Uint16Array(1);
            var code      = new Uint16Array(65536);
            var out       = [];
            var mutate    = Evo.Mutator.mutate;
            var run       = Evo.Interpreter.run;
            var getLabels = Evo.Interpreter.getLabels;
            var getLength = Evo.Interpreter.getLength;
            var segs      = Evo.Interpreter.LINE_SEGMENTS;

            //
            // TIP: this is only a test, we are waiting from
            // TIP: organism 1 in output with index 1 (not 1)
            //
            mem[0] = 1;
            //
            // This is a main loop. Here organism checks if
            // last mutation do the job: generates correct
            // output.
            //
            // TODO: Think about ability to get state of organism:
            // TODO: memory dump, code text and so on.
            //
            for (var i = 0; i < 65530; i++) {
                mutate(code, getLabels(), getLength(), segs);
                run(code, mem, out);

                if (_correctOutput(out)) {
                    break;
                }
            }

            console.log('done');
        }
    };
})();