/**
 * This is main namespace for Evo application. Contains
 * general interface for communication with organisms and
 * entire world.
 *
 * TODO: update general idea of the application: organism
 * TODO: worker, dynamic scripts loading
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
    // TODO:
    var _api = {'in': function () {}};


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
        } else if (uid) {
            _api[data.cmd].apply(null, data.args);
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