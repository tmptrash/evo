/**
 * Implements communication between main thread and Web Workers.
 * It also works in reverse direction from Worker to main thread.
 * It uses unique id's for every request, so it's impossible to
 * loose them.
 *
 * Dependencies:
 *     Evo
 *
 * Example:
 *     TODO:
 *
 * @cfg {Object} config Worker configuration
 *      {Worker} worker Web Worker object, which will be used
 *      {String} id     String prefix for global unique request
 *                      identification. Request id will consist
 *                      of id-XX, where XX - is a number
 *
 * @author DeadbraiN
 */
Evo.Client = function Client(config) {
    /**
     * {String} Application wide unique string prefix
     */
    var _prefix = config.id + '-';
    /**
     * {Function} Just a shortcut
     */
    var _id = -1;
    /**
     * {Object} Requests map. Binds unique ids and response
     * callbacks. It's used for understanding which request
     * belongs to which response.
     */
    var _resp = {};

    /**
     * Handlers of responses. Calls specified callback if it
     * was specified in send() method. If client catches an
     * answer from other server, then it should be skipped.
     * @param {MessageEvent} e
     */
    function _onMessage(e) {
        var id = e.data.id;
        if (id !== _prefix + _id) {return;}

        if (_resp[id]) {
            _resp[id](e);
            delete _resp[id];
        }
    }

    //
    // Here we listen all responses.
    //
    config.worker.addEventListener('message', _onMessage, false);


    return {
        /**
         * Sends a request and wait for answer response. cb will
         * be called if response will be received. cb may be
         * skipped if response is not needed.
         * @param {String} cmd Remote command name
         * @param {Object} cfg Request configuration
         * @param {Function=} respCb Callback for response. First
         * parameter of cb will be data, received in response.
         */
        send: function (cmd, cfg, respCb) {
            _id++;
            if (respCb) {
                _resp[_prefix + _id] = respCb;
            }
            config.worker.postMessage({
                cmd: cmd,
                cfg: cfg,
                req: true,
                id : _prefix + _id
            });
        },
        /**
         * Destroys the instance and remove all data references to prevent
         * memory leaks for multiple instances.
         */
        destroy: function () {
            config.worker.removeEventListener('message', _onMessage, false);
            config.worker.terminate();
        }
    }
};