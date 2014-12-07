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
 * Example:
 *     TODO: describe some real commands examples here
 *
 * Dependencies:
 *     Evo
 *     Evo.Worker
 *     Evo.World
 *
 * @author DeadbraiN
 */
Evo.App = function () {
    /**
     * {Number} Organism's unique number. Is used as an identifier
     * of organisms. You may use it in console commands.
     */
    var _workerId = 0;
    /**
     * {Number} Unique message id. Is increased for every new message post.
     */
    var _msgId = 0;
    /**
     * {Object} Map of organisms (Web workers) organized by id. It's used for
     * different command typed by user in console. Key - Worker id, value -
     * Worker instance.
     */
    var _organisms = {};
    /**
     * {Evo.World} World for all living organisms. In reality it
     * a 2D HTML5 canvas.
     */
    var _world = new Evo.World();


    return {
        /**
         * Creates new organism with parameters in separate Web
         * Worker. Returns unique worker/organism id, which is
         * used for it's configuring and managing. By default
         * Web Worker is in idle state. Any first message
         * (postMessage) will wake it up.
         * @return {Number} Unique worker id
         */
        create: function () {
            var worker = new Worker('js/Loader.js');

            _organisms[_workerId] = new Evo.Connection(worker);
            _organisms[_workerId].send('init', null, null, function (e) {
                var data = e.data;
                var id   = data.id;
                console.log(id + ': ' + 'init()' + ((data.resp + '') === '' ? '' : ':' + data.resp));
            });

            return 'Organism id: ' + _workerId++;
        },
        /**
         * TODO: Add code for removing the organism's particle
         */
        remove: function (id) {
            if (!_organisms[id]) {
                return 'Invalid organism id ' + id;
            }
            _organisms[id].terminate();
            delete _organisms[id];

            return 'done';
        }
        /**
         * Is used to run specified command for specified organism.
         * @param {Number}  id  Unique organism/worker id
         * @param {String}  cmd Command name (eg.: 'live')
         * @param {Object=} cfg Configuration, which is passed to
         * the organism as second parameter.
         * @return {String} 'done' - all ok, error message if not
         */
        // TODO:
        //cmd: _sendMessage
    };
};