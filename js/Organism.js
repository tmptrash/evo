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
     * {Evo.Organism} Reference to this for this class
     */
    var _me = null;
    /**
     * {Array} The body of the organism. The body is a set of particles.
     * Every particle is an energy container (for us it's a color).
     */
    var _body = null;
    /**
     * {Boolean} false means that the organism has died and we need to kill it.
     * All it's activities should be stopped.
     */
    var _alive = true;
    /**
     * {Uint16Array} Binary code of the organism. This code will be
     * changed by Mutator module.
     */
    var _code = null;
    /**
     * {Number} Amount of energy of the organism
     */
    var _energy = 0;
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
        busyCounter: 10000,
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
        energyDecrease: 0.0000001,
        /**
         * {Number} Amount of mutations for current organism. Mutations
         * applies only after cloning (creation).
         */
        mutations: 100000,
        /**
         * {Array} Coordinates of the organism, where it will be created
         * in a World (in canvas). If this parameter will be skipped, then
         * random coordinates will be generated.
         */
        coordinates: null
    };
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
    //var _code2text  = new Evo.Code2Text();
    /**
     * {Evo.Client} Client for main thread. Is used for communicating
     * with the World and it's particles.
     */
    var _client = null;


    /**
     * Mutates an organism by amount according to configuration
     * @returns {Number} New code size in words
     */
    function _mutate() {
        var i;
        var mutations = _cfg.mutations;
        var code      = _code;
        var varsLen   = _interpreter.VARS_AMOUNT;

        for (i = 0; i < mutations; i++) {
            _mutator.mutate(code, varsLen, _mutator.getCodeLen());
        }

        return _mutator.getCodeLen();
    }

    /**
     * in command handler. It gets a value from specified "sensor" in our case
     * the particle in the world and return it's value. Value in this case is
     * amount of energy in the particle.
     * @param {Function} cb Callback, which will be called to pass the value
     * back to the interpreter. This call is asynchronous.
     * @param {Number} dir Direction: 0 - up, 1 - right, 2 - bottom, 3 - left
     */
    function _in(cb, dir) {
        _client.send('in', [_body, dir], function (e) {
            cb(e.data.resp);
        });
    }
    /**
     * out command handler. Just send some value by specified coordinates
     * x and y. It may be interpret like some kind of communication between
     * the organism and the particle. The meaning of this passing is interpreted
     * by the World or application so it may be changed depending on World rules.
     * @param {Number} dir Direction: 0 - up, 1 - right, 2 - bottom, 3 - left
     * @param {Number} val Energy value
     * @private
     */
    function _out(dir, val) {
        _client.send('out', [_body, dir, val], function (res) {
            //
            // true means, that out command was successful and energy value
            // was applied into the particle. So we need to decrease organism's
            // energy
            //
            if (res) {
                _cfg.energy -= val;
            }
        });
    }
    /**
     * Makes one step (1 pixel) by the organism with specified direction.
     * @param {Function} cb Callback, which should be called on response
     * @param {Number} dir Direction: 0 - up, 1 - right, 2 - bottom, 3 - left
     */
    function _step(cb, dir) {
        _client.send('step', [_body, dir], function (e) {
            //
            // New body position
            //
            _body = e.data.resp;
            cb();
        });
    }
    /**
     * Grabs one energy point from nearest particle.
     * @param {Number} dir Direction: 0 - up, 1 - right, 2 - bottom, 3 - left
     * @param {Number} energy Amount of energy, the organism wants to eat
     */
    function _eat(dir, energy) {
        _client.send('eat', [_body, dir, energy], function (energy) {
            _cfg.energy += energy;
        });
    }
    /**
     * Echoes some number. Analog of speaking.
     * @param {Number} val Output number.
     */
    function _echo(val) {
        _client.send('echo', [val]);
    }
    /**
     * Organisms cloning command handler. This is how it they increase a population.
     * The direction of cloning is a new place (x,y coordinates) for new organism.
     * @param {Number} dir Direction: 0 - up, 1 - right, 2 - bottom, 3 - left
     */
    function _clone(dir) {
        _client.send('clone', [_body, dir, _energy, _code]);
    }


    return (_me = {
        /**
         * Initializes the organism. id property is required.
         * TODO: review these parameters. I think most of them may be removed
         * @param {Object}      cfg             Start configuration of the organism
         *        {Uint16Array} code            Start code
         *        {Array}       coordinates     Array of two items: [x, y] coordinates of the organism
         *        {String}      colorCode       Color of the text script
         *        {Number}      maxNumber       Maximum available number in script
         *        {Number}      busyCounter     Amount of iterations, which will be run in background without breaking
         *        {Number}      memSize         Organism's memory size in words (2 * memSize byte)
         *        {Number}      codePadding     Padding of text code for every column: command, arg1, arg2, arg3
         *        {Number}      energy          Amount of energy which is inside the organism from the beginning
         *        {Number}      energyDecrease  Value, which is decrease an energy after every script run
         *        {Number}      mutations       Amount of mutations which are applied after organism cloning.
         *        {Boolean}     live            Flag, which starts an organism to live just after creation
         * @returns {Boolean|String} true or error message
         */
        init: function (cfg) {
            //
            // All required parameters should be checked here
            //
            if (!cfg.coordinates || cfg.coordinates.length < 2) {
                return 'Organism coordinates were not set. Use format: [x,y]';
            }

            for (var i in cfg) {
                if (cfg.hasOwnProperty(i)) {
                    _cfg[i] = cfg[i];
                }
            }
            //
            // Organism start position in the World (canvas)
            //
            _body = _cfg.coordinates;
            //
            // This is how we mark the worker and organism. Every
            // Worker/Organism has it's own unique identifier.
            //
            _client = new Evo.Client({worker: self, id: _cfg.id + '->0'});
            //
            // We do it to setup default callback methods, which will
            // be the same for every Evo.Interpreter.run() call
            //
            _interpreter.run({
                code   : [],
                codeLen: 0,
                inCb   : _in,
                outCb  : _out,
                stepCb : _step,
                eatCb  : _eat,
                echoCb : _echo,
                cloneCb: _clone
            });
            //
            // Organism should be alive just after creation
            //
            if (cfg.live) {
                _me.live();
            }
            return true;
        },
        /**
         * TODO: describe logic about: mutation -> prev. data checks -> revert -> loop
         * TODO: add method description
         */
        live: function () {
            //
            // All this section is only for run speed increasing,
            // because local variables are faster, then global.
            //
            var busyCounter = _cfg.busyCounter;
            var mutations   = _cfg.mutations;
            var mem         = new Uint16Array(_cfg.memSize);
            var code        = _cfg.code || new Uint16Array(mutations * _interpreter.LINE_SEGMENTS);
            var out         = [];
            var energyDec   = _cfg.energyDecrease;
            var len         = _cfg.code ? code.length : 0;
            var b;
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
                while (b++ < busyCounter && _alive) {
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
                    _energy -= (energyDec * len);
                    //
                    // This is how organism dies :(
                    //
                    if (_energy < 1) {
                        _alive = false;
                    }
                }
                //
                // This line is very important, because it decrease CPU
                // load and current thread works "silently"
                //
                if (_alive) {
                    setTimeout(backgroundLive, 0);
                }
            }


            _energy = _cfg.energy;
            _code = code;
            //
            // Right after born, organism should mutate itself
            //
            len = _mutate();
            //
            // This is an entry point of living process.
            // All other looping will be in background
            // and used may type different commands
            //
            setTimeout(backgroundLive, 0);

            return true;
        },
        /**
         * Decreases amount of energy from organism
         * @param {Number} energy Energy we need to decrease
         */
        grabEnergy: function (energy) {
            _energy -= energy;
            if (_energy < 1) {
                _alive = false;
            }
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
            return new Uint16Array((_code || new Uint16Array()).subarray(0, _interpreter.getCodeLen()));
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
         * Returns amount of energy of the organism
         * @return {Number} amount of energy
         */
        getEnergy: function () {
            return _energy;
        }
    });
};