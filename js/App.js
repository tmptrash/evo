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
     * {Object} Remote commands map. It's used for join send command params
     * and Worker answer value. After Worker answer specified record is deleted.
     */
    var _cmds = {};
    /**
     * {Function} Stub for callbacks
     */
    var _emptyFn = function () {};
    /**
     * {Evo.World} World for all living organisms. In reality it
     * a 2D HTML5 canvas.
     */
    var _world = new Evo.World();
    /**
     * {Object} API for current app and Web Workers. This map binds command
     * names and they handlers. These command are called from Web Workers
     * by message sending/receiving.
     */
    // TODO: will be moved to Organism class
    var _api = {
        'in'   : _in,
        'out'  : _out,
        'step' : _step
    };


    // TODO: will be moved to Organism class
    /**
     * in command handler. Is called from the organism. See Interpreter.in
     * command for details.
     * @param {Number} x X coordinate
     * @param {Number} y Y coordinate
     * @return {Number} Result
     */
    function _in(x, y) {
        return _world.getPixel(x, y);
    }
    // TODO: will be moved to Organism class
    /**
     * out command handler. Is called from the organism. See Interpreter.out
     * command for details.
     * @param {Number} x X coordinate
     * @param {Number} y Y coordinate
     * @return {Number} Result
     */
    function _out(x, y, col) {
        return _world.setPixel(x, y, col);
    }
    /**
     * Handler of message event from Web Worker. Shows worker
     * (organism) response in console or runs specified method
     * in current application. Depending on type of message:
     * answer or request.
     * TODO: describe parameters: id, uid
     * @param {MessageEvent} e.data
     * @private
     */
    function _onMessage(e) {
        debugger;
        var data = e.data;
        var id   = data.id;
        var uid  = data.uid;

        //
        // This message is an answer from Worker
        //
        if (id !== undefined) {
            console.log(id + ': ' + _cmds[id] + (data.resp == '' ? '' : ':' + data.resp));
            delete _cmds[id];
        //
        // This message is a request from Worker
        //
        // TODO: will be moved to Organism class
        } else if (uid) {
            _organisms[uid].postMessage({
                uid : uid,
                args: _api[data.cmd].apply(null, data.args)
            });
        }
    }
    /**
     * Send message to Worker (organism) and notify about result in console
     * @param {Number}  wId Worker (organism) unique id
     * @param {String}  cmd Remote organism's command
     * @param {Object=} cfg Command configuration
     * @returns {String}
     * @private
     */
    function _sendMessage(wId, cmd, cfg) {
        if (!_organisms[wId]) {
            return 'Invalid organism wId ' + wId;
        }
        if (typeof cmd !== 'string' && cmd.constructor !== String) {
            return 'Invalid command ' + cmd;
        }
        if (typeof cfg !== 'object' && cfg !== undefined) {
            return 'Invalid configuration. Object required.';
        }

        //
        // Here, we should use simple JSON object to exclude
        // functions in configuration.
        //
        _cmds[_msgId] = cmd + '(' + (cfg === undefined ? '' : JSON.stringify(cfg)) + ')';
        _organisms[wId].postMessage({
            cmd: cmd,
            cfg: cfg ? JSONfn.stringify(cfg) : cfg,
            id : _msgId
        });
        _msgId++;

        return 'done';
    }
    /**
     * TODO: update this comment
     *
     * @param {String} cmd Remote command
     * @param {Function|Array} cb Callback, which is used for passing in value to
     * the Worker (Organism). Contains one parameter - the value. In case of
     * array this parameters is passed arguments.
     * @param {Array=} args Custom parameters
     */
    // TODO: will be moved to Organism class
    function _remoteCb(cmd, cb, args) {
        cb   = typeof cb === 'function' ? cb : _emptyFn;
        args = args || [];

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
            _organisms[_workerId] = new Worker('js/Loader.js');
            _organisms[_workerId].addEventListener('message', _onMessage.bind(this));
            _sendMessage(_workerId, 'init', {
                id     : _workerId,
                inCb   : _remoteCb,
                outCb  : _remoteCb,
                stepCb : _remoteCb,
                eatCb  : _remoteCb,
                cloneCb: _remoteCb
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
        },
        /**
         * Is used to run specified command for specified organism.
         * @param {Number}  id  Unique organism/worker id
         * @param {String}  cmd Command name (eg.: 'live')
         * @param {Object=} cfg Configuration, which is passed to
         * the organism as second parameter.
         * @return {String} 'done' - all ok, error message if not
         */
        cmd: _sendMessage
    };
};