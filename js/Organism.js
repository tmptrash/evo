/**
 * TODO: describe how organism works: mutations, memory, input, output,...
 * TODO: Add default values for config parameters
 * TODO: Code2Text class should be moved from Organism. It should only contain
 * TODO: binary code. Code formatting is a task for App class
 *
 * Dependencies:
 *     Evo
 *     Evo.Mutator
 *     Evo.Code2Text
 *     Evo.Interpreter
 *
 * @author DeadbraiN
 */
Evo.Organism = function Organism() {
    /**
     * {Array} The body of the organism. The body is a set of particles.
     * Every particle is an energy container (for us it's a color).
     */
    var _body = [];
    /**
     * {Uint16Array} Binary code of the organism. This code will be
     * changed by Mutator module.
     */
    var _code = null;
    /**
     * {Function} For stubs
     */
    var _emptyFn = function () {};
    /**
     * {Object} Configuration of current organism. If some properties
     * will not be set, then default values will be used. Should contain
     * default values from the scratch.
     */
    var _cfg  = {
        /**
         * {String} The color of script in the console
         */
        colorCode: '#707070',
        /**
         * {Number} Maximum number value for organism. This is a value,
         * which our organism may proceed. It also understandable for
         * Interpreter and Mutator
         */
        maxNumber: 65535,
        /**
         * {Number} Amount of non interruptable iterations between
         * user commands from console. This parameter affects on
         * speed of used command response time. If this parameter
         * is big, then background calculations will be long and
         * user commands processing will be delayed. It depends
         * on current PC performance.
         */
        blockIterations: 50000,
        /**
         * {Number} Size of organism's memory in words (2 * MEMORY_SIZE bytes)
         */
        memSize: 100,
        /**
         * {Number} Default padding for human readable scripts
         */
        codePadding: 5,
        /**
         * {Number} Amount of energy for current organism. 0 means, that
         * the organism is dead. > 0 means alive.
         */
        energy: 1000000,
        /**
         * {Number} Minimal amount of energy, which is used to decrease
         * it's value every time, the organism is run the script or
         * do a mutation
         */
        energyDecrease: 0.0001,
        /**
         * {Number} Speed of new mutations: 1 - one mutation per one
         * script run, 2 - 1 mutation per 2 script running and so on.
         * As bigger this value is, as slower the mutations are.
         */
        mutationSpeed: 100
    };
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
    var _lastData = [];
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
     * {Evo.Code2Text} Utility class for representing of binary code
     * in human readable manner.
     */
    var _code2text  = new Evo.Code2Text();


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

    /**
     * Sends one message and wait for answer. The message has it's unique
     * identifier. This is how we catch exact answer from main thread.
     * @param {Object} cfg Configuration, which will be passed in request.
     * @param {String} id  Unique identifier of request
     */
    function _sendMessage(cfg) {

    }
    /**
     * in command handler. It gets a value from specified "sensor" in our case
     * the particle in the world and return it's value. Value in this case is
     * amount of energy in the particle.
     * @param {Function} cb Callback, which will be called to pass the value
     * back to the interpreter. This call is asynchronous.
     * @param {Number} x X coordinate of the sensor
     * @param {Number} y Y coordinate of the sensor
     * @private
     */
    function _in(cb, x, y) {
        function answerFn(e) {
            var data = e.data;
            if (data && data.id === self.organismId) {
                cb(data.resp);
                self.removeEventListener('message', answerFn, false);
            }
        }

        //
        // Current command requires answer. We need to add temporary
        // callback for this.
        //
        if (cb !== _emptyFn) {
            self.addEventListener('message', answerFn, false);
        }
        self.postMessage({
            cmd : cmd,
            args: args,
            uid : self.organismId
        });
    }
    function _out() {}
    function _step() {}
    function _eat() {}
    function _echo() {}
    function _clone() {}


    return {
        /**
         * Initializes the organism. id property is required.
         * @param {Object} cfg Organism configuration
         * @returns {boolean}
         */
        init: function (cfg) {
            for (var i in cfg) {
                if (cfg.hasOwnProperty(i)) {
                    _cfg[i] = cfg[i];
                }
            }
            //
            // This is how we mark the worker and organism. Every
            // Worker/Organism has it's own unique identifier.
            //
            // TODO: do we need this is?
            self.organismId = cfg.id;

            return true;
        },
        /**
         * TODO: describe logic about: mutation -> prev. data checks -> revert -> loop
         * Starts organism to leave on. Live means pass all data sets (tests) by
         * finding specific binary script obtained by mutations.
         * @param {Object} config            Start configuration of the organism
         *        {String}   colorCode       Color of the text script
         *        {Number}   maxNumber       Maximum available number in script
         *        {Number}   blockIterations Amount of iterations, which will be run in background without breaking
         *        {Number}   memSize         Organism's memory size in words (2 * memSize byte)
         *        {Number}   codePadding     Padding of text code for every column: command, arg1, arg2, arg3
         *        {Number}   energy          Amount of energy which is inside the organism from the beginning
         *        {Number}   energyDecrease  Value, which is decrease an energy after every script run
         *        {Array}    position        X and Y coordinates array of the body particles.
         *        {Number}   mutationSpeed   Speed of new mutations: 1 - one mutation per one script run, 2  - 1
         *                                   mutation per 2 script running and so on. As bigger this value is, as
         *                                   slower the mutations are.
         *        {Function} inCb            'in' command callback. See Evo.Interpreter.inCb config for details.
         *        {Function} outCb           'out' command callback. See Evo.Interpreter.outCb config for details.
         *        {Function} stepCb          'step' command callback. See Evo.Interpreter.stepCb config for details.
         *        {Function} eatCb           'eat' command callback. See Evo.Interpreter.eatCb config for details.
         *        {Function} echoCb          'echo' command callback. See Evo.Interpreter.echoCb config for details.
         *        {Function} cloneCb         'clone' command callback. See Evo.Interpreter.cloneCb config for details.
         */
        live: function (config) {
            //
            // All this section is only for run speed increasing,
            // because local variables are faster, then global.
            //
            var maxNumber  = config.maxNumber || _cfg.maxNumber;
            var backAmount = config.blockIterations || _cfg.blockIterations;
            var mem        = new Uint16Array(config.memSize);
            var code       = new Uint16Array(maxNumber);
            var out        = [];
            var varsLen    = _interpreter.VARS_AMOUNT;
            var energyDec  = config.energyDecrease || _cfg.energyDecrease;
            var mutSpeed   = config.mutationSpeed || _cfg.mutationSpeed;
            var energy     = config.energy || _cfg.energy;
            var m          = 0;
            var len;
            var b;

            _code = code;

            /**
             * This method calls as a background thread. As you know
             * JavaScript doesn't support multithreading. So we need to
             * use setTimeout() for this. As a result we may type different
             * commands in console, while organism is leaving.
             */
            function backgroundLive() {
                b = 0;
                //
                // This is a main loop. Here organism checks if
                // last mutation do the job: generates correct
                // output.
                //
                while (b++ < backAmount) {
                    //
                    // This is how we control the mutations speed. As big
                    // config.mutationSpeed as slow the mutations are.
                    //
                    if (m-- < 1) {
                        _mutator.mutate(code, varsLen, _mutator.getCodeLen());
                        _curMutations++;
                        len = _mutator.getCodeLen();
                        //
                        // When all allocated memory for binary script is reached, we need
                        // to reallocate it new bigger size.
                        //
                        if (len === maxNumber) {
                            maxNumber = _reallocateCode();
                            code = _code;
                        }
                        //
                        // Mutations also decrease the energy resource
                        //
                        energy -= energyDec;
                        m = mutSpeed;
                    }
                    //
                    // We don't need to change memory between the iterations.
                    // Organism should remember it's previous experience. Thw
                    // same about output.
                    //
                    _interpreter.run({
                        code   : code,
                        mem    : mem,
                        out    : out,
                        codeLen: len
                    });
                    //
                    // After every script run, we need to decrease organism's energy.
                    // As big the script is, as more the energy we need.
                    //
                    energy -= (energyDec * len);
                }
                //
                // Calculation of all mutations should be here, outside
                // the loop, because of performance issue.
                //
                _allMutations += _curMutations;
                _curMutations = 0;
                //
                // This line is very important, because it decrease CPU
                // load and current thread works "silently"
                //
                setTimeout(backgroundLive, 0);
            }

            _allMutations = _curMutations = 0;
            //
            // We do it to setup default callback methods, which will
            // be the same for every Evo.Interpreter.run() call
            //
            _interpreter.run({
                code   : code,
                codeLen: 0,
                inCb   : _in,
                outCb  : _out,
                stepCb : _step,
                eatCb  : _eat,
                echoCb : _echo,
                cloneCb: _clone
            });
            //
            // This is an entry point of living process.
            // All other looping will be in background
            // and used may type different commands
            //
            backgroundLive();
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
            //
            // We need to exclude an ability to create a reference to the
            // binary code, because organism is leaving now and mutator
            // is changing binary code right now. So our changing of this
            // code here may affect it in organism.
            //
            var code = new Uint16Array(_code.subarray(0, _interpreter.getCodeLen()));

            // TODO: config
            padWidth = padWidth || _cfg.codePadding;

            if (skipFormat === true || skipFormat === undefined) {
                return code;
            }
            if (skipFormat.indexOf('text') !== -1) {
                console.log('%c' + _code2text.format(_code2text.convert(code), padWidth, skipFormat.indexOf('textNoLines') !== -1), 'color: ' + _cfg.colorCode);
                return undefined;
            }

            return _code2text.format(_code2text.convert(code), padWidth, skipFormat.indexOf('textNoLines') !== -1);
        },
        /**
         * Returns memory dump of organism according to actual binary script. It's
         * important, that we use a copy of the memory and not it's original one.
         * @returns {Uint16Array}
         */
        getMemory: function () {
            // TODO: config
            var mem = new Uint16Array(_cfg.maxNumber);
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
            // TODO: config
            var mem = new Uint16Array(_cfg.maxNumber);
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
    };
};