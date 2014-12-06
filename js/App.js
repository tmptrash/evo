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
     * TODO:
     * {Object} Map of organisms (Web workers) organized by id.
     */
    var _organisms = {};
    /**
     * {Evo.World} World for all living organisms. In reality it
     * a 2D HTML5 canvas.
     */
    var _world = new Evo.World();

    /**
     * Handler of message event from Web Worker. Shows worker
     * (organism) response in console.
     * @param {MessageEvent} e.data
     * @private
     */
    function _onMessage(e) {
        var data = e.data;
        console.log(data.id + ': ret[' + data.resp + ']');
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

        _msgId++;
        //
        // Here, we should use simple JSON object to exclude
        // functions in configuration
        //
        console.log(_msgId + ': ' + cmd + ' ' + JSON.stringify(cfg));
        _organisms[wId].postMessage({
            cmd: cmd,
            cfg: cfg ? JSONfn.stringify(cfg) : cfg,
            id : _msgId
        });

        return 'done';
    }
    // TODO:
    function _inCb() {

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
                // TODO:
                inCb: _inCb
            });

            return _workerId++;
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