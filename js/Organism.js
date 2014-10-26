/**
 * TODO: describe how organism works: mutations, memory, input, output,...
 *
 * @author DeadbraiN
 */
Evo.Organism = (function () {
    /**
     * Checks if last mutation generates correct output
     * @private
     */
    function _correctOutput() {

    }


    return {
        /**
         * Starts organism to leave on
         */
        live: function () {
            var mem  = new Uint16Array(1);
            var code = new Uint16Array(256);
            var out  = [];

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
            while (1) {
                Evo.Mutator.mutate(code);
                Evo.Interpreter.run(code, mem, out);

                if (_correctOutput(mem)) {
                    break;
                }
            }
        }
    };
})();