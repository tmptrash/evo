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
 * @cfg {Worker} worker Web Worker object, which will be used
 * for requests and catching on responses.
 *
 * @author DeadbraiN
 */
Evo.Connection = function Connection(worker) {
    /**
     * {Number} Unique identifier for requests and responses.
     */
    var _id   = 0;
    /**
     * {Object} Requests map. Binds unique ids and response
     * callbacks. It's used for understanding which request
     * belongs to which response.
     */
    var _resp = {};

    /**
     * Handlers of responses. Calls specified callback if it
     * was specified in send() method.
     * @param {MessageEvent} e
     */
    function _onMessage(e) {
        debugger;
        var id = e.data.id;

        if (_resp[id]) {
            _resp[id](e);
            delete _resp[id];
        }
    }

    //
    // Here we listen all responses.
    //
    worker.addEventListener('message', _onMessage.bind(this), false);


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
            if (respCb) {
                _resp[_id] = respCb;
            }
            worker.postMessage({
                cmd: cmd,
                cfg: cfg,
                id : _id++
            });
        }
    }
};