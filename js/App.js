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
        organismColor: 16711680,
        /**
         * {Number} Default color of energy particle (0x00FF00 - Green)
         */
        energyColor  : 65280
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
        'in'  : _in,
        'out' : _out,
        'step': _step,
        'eat' : _eat
    };


    /**
     * Converts direction to x coordinate. e.g.: if dir === 1 and x === 2,
     * then return value will be 2 + 1 === 3
     * @param {Number} x Start x coordinate
     * @param {Number} dir Direction: 0 - up, 1 - right, 2 - bottom, 3 - left
     * @returns {Number} New coordinate
     */
    function _dir2x(x, dir) {
        return x + (dir === 1 ?  1 : (dir === 3 ? -1 : 0));
    }
    /**
     * Converts direction to y coordinate. e.g.: if dir === 0 and y === 2,
     * then return value will be 2 - 1 === 1
     * @param {Number} y Start y coordinate
     * @param {Number} dir Direction: 0 - up, 1 - right, 2 - bottom, 3 - left
     * @returns {Number} New coordinate
     */
    function _dir2y(y, dir) {
        return y + (dir === 0 ? -1 : (dir === 2 ?  1 : 0));
    }
    /**
     * Outputs results of Evo.Client.send() command in a console
     * @param {MessageEvent} e Obtained event
     * @param {String} cmd Command name
     * @param {Object} cfg CommaND configuration
     * @private
     */
    function _logSend(e, cmd, cfg) {
        var data = e.data;
        // TODO: data.rest may be Uint16Array and we need to convert it to string
        console.log(data.id + ': ' + cmd + '(' + JSON.stringify(cfg) + ')' + ((data.resp + '') === '' ? '' : ':' + data.resp));
    }
    /**
     * in command handler. in command means checking of specified sensor
     * (particle) near the organism. It's coordinates are in body parameter
     * in format [x,y].
     * @param {Array} body Array of coordinates in format [x,y]
     * @param {Number} dir Direction of the sensor: 0 - up, 1 - right, 2 -
     * bottom, 3 - left
     * @return {Number} Amount of energy, which were grabbed from particle.
     * It's possible that this amount will be equal to zero, because there
     * is no particle for example.
     */
    function _in(body, dir) {
        return _world.getPixel(_dir2x(body[0], dir), _dir2y(body[1], dir));
    }
    /**
     * out command handler. It puts an energy portion to the nearest particle
     * or just on the ground
     * @param {Array} body Array of coordinates [x,y]
     * @param {Number} dir Direction: 0 - up, 1 - right, 2 - bottom, 3 - left
     * @param {Number} energy Amount of energy we need to put
     * @private
     */
    function _out(body, dir, energy) {
        var x = _dir2x(body[0], dir);
        var y = _dir2y(body[1], dir);

        // TODO: it's possible to obtain energy more then 00ff00 (65535). what to do?
        return _world.setPixel(x, y, _world.getPixel(x, y) + energy);
    }
    /**
     * Makes one step with specified direction
     * @param {Array} body Coordinates of the organism's body [x, y]
     * @param {Number} dir Direction: 0 - up, 1 - right, 2 - bottom, 3 - left
     * @returns {Array} New coordinates of organism or old one if
     * impossible to move
     */
    function _step(body, dir) {
        var x       = _dir2x(body[0], dir);
        var y       = _dir2y(body[1], dir);
        var oldHash = _hash(body[0], body[1]);

        //
        // If new place for organism is free, them clear previous
        // position and put new one.
        //
        if (!_world.getPixel(x, y)) {
            _organisms[_hash(x, y)] = _organisms[oldHash];
            delete _organisms[oldHash];
            _world.setPixel(x, y, _cfg.organismColor);
            _world.setPixel(body[0], body[1], 0);
            return [x, y];
        }

        //
        // We can't move in this direction
        //
        return body;
    }
    /**
     * eat command handler. Eats
     * @param {Array} body Array of coordinates [x,y]
     * @param {Number} dir Direction: 0 - up, 1 - right, 2 - bottom, 3 - left
     * @param {Number} energy Amount of energy we need to put
     * @private
     */
    function _eat(body, dir, energy) {
        var x          = _dir2x(body[0], dir);
        var y          = _dir2y(body[1], dir);
        var nearEnergy = _world.getPixel(x, y);
        var hash       = _hash(x, y);

        if (nearEnergy) {
            if (nearEnergy - energy > 0) {
                nearEnergy = energy;
            }
            //
            // Our organism tries to eat nearest organism
            //
            if (_organisms[hash]) {
                _organisms[hash].send('grabEnergy', nearEnergy, function (e) {
                    _logSend(e, 'grabEnergy', nearEnergy);
                });
            }
        }

        return nearEnergy;
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
        },
        /**
         * Creates energy particles in the World randomly.
         * @param {Number} amount Amount of particles we need to create
         */
        createEnergy: function (amount) {
            var rnd    = Math.random;
            var floor  = Math.floor;
            var width  = _world.getWidth();
            var height = _world.getHeight();
            var x;
            var y;

            while (amount) {
                x = floor(rnd() * width);
                y = floor(rnd() * height);

                if (!_world.getPixel(x, y)) {
                    // TODO: this energy value should be configurable
                    _world.setPixel(x, y, _cfg.energyColor); // 0x00FF00 - Green
                    amount--;
                }
            }

            return 'done';
        }
    };
};