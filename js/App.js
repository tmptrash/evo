/**
 * TODO: add help command to the console with examples and description for
 * TODO: commands.
 *
 * This is an application class of Evo. Evo is a shortcut of Evolution. It
 * simulates biological evolution in a little bit different way. This class
 * also a proxy between a user, who types commands in a console and all
 * organisms in a system. User may control every organism and application
 * in general using embedded Google Chrome console (Dev Tool) through evo
 * object. Organism is a living creature, which has a "body" (one pixel),
 * a memory and it's binary code (like DNA). This code is translated by
 * special Interpreter (see Interpreter class), which is also embedded
 * into the organism. There are many organisms in application. They all
 * live in a special place - World. Technically it a canvas in DOM model
 * with special size. Every organism is independent from other and has
 * it's own binary code, which may be mutated while born. For now every
 * organism lives in separate Web Worker. This is how we simulate
 * independent living.
 * To start using this World and organisms you need to create them with
 * create() method. Like this:
 *
 *     evo.create()
 *
 * This method returns created organism's unique identifier. You should
 * use this id to access the organism. For example, if we need to get
 * organism's output:
 *
 *     evo.cmd(0, 'getOutput')
 *
 * You need to remember, that all these communications are work between
 * main thread and Web Workers. So, some small delay will be generated
 * by the browser, because of communication reason.
 *
 * Dependencies:
 *     Evo
 *     Evo.World
 *     Evo.Worker
 *     Evo.Connection
 *
 * Example:
 *     TODO: describe some real command examples here
 *
 * @author DeadbraiN
 */
Evo.App = function () {
    /**
     * {Object} Default application wide configuration
     */
    var _cfg = {
        /**
         * {Number} Color of the organism's body (0xFF0000 - Red).
         */
        organismColor: 16711680
    };
    /**
     * {Number} Organism's unique number. Is used as an identifier
     * of organisms. You may use it in console commands. Should be
     * started from 1, because 0 is a main thread.
     */
    var _organismId = 1;
    /**
     * {Object} Map of Worker Clients organized by id. It's used for
     * communication between this, main thread and Web Workers(organisms).
     * For case when main thread produce request for Workers and they
     * (Server) produces responses.
     */
    var _clients = {};
    /**
     * {Object} Web Worker Servers. Is used for communication between
     * Organism and this, main thread. For case, when request is generated
     * on Organism size and the Server (response producer) is here.
     */
    var _servers = {};
    /**
     * {Object} Map of organisms coordinates. Every organism has it's own
     * position (x and y coordinates) in a World (canvas). The hash from
     * these coordinates from every organism is stored in this map. It's
     * needed for synchronizing between different organisms. I mean moving
     * energy grabbing and so on. Key - coordinates hash, value -
     * Evo.Client instance.
     */
    var _organisms = {};
    /**
     * {Evo.World} World for all living organisms. In reality it
     * a 2D HTML5 canvas.
     */
    var _world = new Evo.World();
    /**
     * {Object} Map of supported commands, which are called by organisms
     * in remote Web Workers. There are some command, which can't be finished
     * without checks in main thread. For example: grabbing an energy from
     * near particle. The canvas with these particles are in main thread, so
     * Web Worker with organism know nothing about other particles and it
     * need to ask main thread.
     */
    var _api = {
        'in': _in
    };


    /**
     * Outputs results of Evo.Client.send() command in a console
     * @param {MessageEvent} e Obtained event
     * @param {String} cmd Command name
     * @param {Object} cfg CommaND configuration
     * @private
     */
    function _logSend(e, cmd, cfg) {
        var data = e.data;
        console.log(data.id + ': ' + cmd + '(' + JSON.stringify(cfg) + ')' + ((data.resp + '') === '' ? '' : ':' + data.resp));
    }
    /**
     * in command handler. in command means checking of specified sensor
     * (particle) near the organism. It's coordinates are in body parameter
     * in format [x,y]. This method grabs one energy block from the particle
     * near the organism and updates this particle or returns zero id there
     * is no particle there.
     * @param {Array} body Array of coordinates in format [x,y]
     * @param {Number} dir Direction of the sensor: 0 - up, 1 - right, 2 -
     * bottom, 3 - left
     * @return {Number} Amount of energy, which were grabbed from particle.
     * It's possible that this amount will be equal to zero, because there
     * is no particle for example.
     */
    function _in(body, dir) {
        var x         = body[0] + (dir === 1 ? 1 : (dir === 3 ? -1 : 0));
        var y         = body[1] + (dir === 0 ? 1 : (dir === 2 ? -1 : 0));
        var energy    = _world.getPixel(x, y);
        var energyDec = 1;
        var hash;

        if (energy) {
            energy -= energyDec;
            hash    = _hash(x, y);
            //
            // near particle is another organism
            //
            if (_organisms[hash]) {
                _organisms[hash].send('grabEnergy', energyDec, function (e) {
                    _logSend(e, 'grabEnergy', energyDec);
                });
            }
            _world.setPixel(x, y, energy);
        }

        return energy;
    }
    /**
     * Web Workers messages receiver. Handles requests from Organisms
     * and sends answers back.
     * @param {MessageEvent} e Message from Client (Organism)
     * @return {Number} number, which will be returned to the organism
     */
    function _onMessage(e) {
        var data = e.data;
        var cmd  = data.cmd;

        if (cmd && _api[cmd]) {
            return _api[cmd].apply(null, data.cfg);
        }

        return 'Invalid command "' + cmd + '"';
    }
    /**
     * Obtains coordinates unique hash.
     * @return {String} Unique hash for coordinates
     */
    function _hash(x, y) {
        return (y * _world.getWidth() + x) + '';
    }
    /**
     * Calculates organism coordinates and it's hash.
     * @param {Object} cfg Organism configuration
     * @return {Object} {hash: String, coordinates: Array}
     */
    function _getCoordinates(cfg) {
        var done   = false;
        var rnd    = Math.random;
        var floor  = Math.floor;
        var width  = _world.getWidth();
        var height = _world.getHeight();
        var x;
        var y;

        if (cfg.coordinates === undefined) {
            while (!done) {
                x = floor(rnd() * width);
                y = floor(rnd() * height);
                if (!_world.getPixel(x, y)) {
                    done = true;
                }
            }
        } else {
            x = cfg.coordinates[0];
            y = cfg.coordinates[1];
        }

        return {hash: _hash(x, y), coordinates: [x, y]}
    }


    return {
        /**
         * Creates new organism with parameters in separate Web
         * Worker. Returns unique worker/organism id, which is
         * used for it's configuring and managing. By default
         * Web Worker is in idle state. Any first message
         * (postMessage) will wake it up.
         * @param {Object} cfg Organism configuration. See
         * Organism.init() for details.
         * @return {Number} Unique worker id
         */
        create: function (cfg) {
            cfg = cfg || {};

            var worker = new Worker('js/Loader.js');
            var id     = _organismId;
            var coord  = _getCoordinates(cfg);

            cfg.id = id;
            cfg.coordinates = coord.coordinates;
            //
            // '0' means main thread (this thread), All Workers start from 1.
            // Every organism is a server for this (main) thread. This thread
            // is a client.
            //
            _clients[id] = new Evo.Client({worker: worker, id: '0->' + id});
            //
            // Every organism has it's own coordinates.
            //
            _organisms[coord.hash] = _clients[id];
            //
            // Server class for communicating with this special organism(worker)
            //
            _servers[id] = new Evo.Server({worker: worker});
            _servers[id].listen(_onMessage);
            _clients[id].send('init', cfg, function (e) {
                var data = e.data;
                _logSend(e, 'init', cfg);
                if (data.resp === true) {
                    _world.setPixel(cfg.coordinates[0], cfg.coordinates[1], _cfg.organismColor);
                }
            });

            return 'Organism id: ' + _organismId++;
        },
        /**
         * Is used to run specified command for specified organism.
         * @param {Number}  id  Unique organism/worker id
         * @param {String}  cmd Command name (eg.: 'live')
         * @param {Object=} cfg Configuration, which is passed to
         * the organism as second parameter.
         * @return {String} 'done' - all ok, error message if not
         */
        cmd: function (id, cmd, cfg) {
            if (typeof id !== 'string' && typeof id !== 'number' || !_clients[id]) {
                return 'Invalid id "' + id + '"';
            }
            if (cmd === '' || typeof cmd !== 'string') {
                return 'Command not set. Use camelCase command name.';
            }

            cfg = cfg || {};
            cfg.id = id;
            _clients[id].send(cmd, cfg, function (e) {
                _logSend(e, cmd, cfg);
            });

            return 'done';
        },
        /**
         * TODO: Add code for removing the organism's particle. special message
         * TODO: should be passed to the Worker.
         */
        remove: function (id) {
            if (typeof id !== 'string' && typeof id !== 'number' || !_clients[id]) {
                return 'Invalid id "' + id + '"';
            }

            _clients[id].destroy();
            _servers[id].destroy();
            delete _servers[id];
            delete _clients[id];

            return 'done';
        }
    };
};