/**
 * Server class for communication between Client and Server. This class answers
 * to the requests. Every request is a command+config+id. Command is a name of
 * the method, which should be called on Server side. Config - is a configuration,
 * which will be passed to the method. id - is a unique identification of
 * request/response. Response value will be sent by resp property.
 *
 * Dependencies:
 *     Evo
 *
 * Example:
 *     TODO:
 *
 * @cfg {Object} cfg    Web Worker configuration
 *      {Worker} worker Web Worker object we are working with
 *
 * @author DeadbraiN
 */
Evo.Server = function Server(cfg) {
    /**
     * {Function} Callback, which is called on message receive.
     */
    var _msgCb = null;
    /**
     * Main thread messages receiver. Runs commands on organism
     * and returns answers through  postMessage(). Every message
     * from outside the Worker should contain at least two arguments:
     * command name and message id. Return command value will be
     * passed through answer message in resp parameter. If server
     * catches an answer from client, then this message should be
     * skipped. We understands it by req parameter. It should be
     * true. It means that this is a request for a server.
     * @param {MessageEvent} e.data
     *        {String}         cmd Command (name of the method) to run.
     *        {Object|String=} cfg Configuration for cmd
     *        {String}         id  Unique message id.
     */
    function _onMessage(e) {
        debugger;
        if (!e.data.req) {return;}
        var value = _msgCb(e);

        if (value !== undefined) {
            cfg.worker.postMessage({
                resp: value,
                req : false,
                id  : e.data.id
            });
        }
    }


    return {
        /**
         * Starts the server listening. After this call server may receive
         * requests from client and do responses.
         * @param {Function} msgCb Callback, which is called every time
         * when a message arrives. The value, which is returned by this
         * function will be used as a response value. If this callback
         * returns undefined, the no response will be sent.
         */
        listen: function (msgCb) {
            _msgCb = msgCb;
            cfg.worker.addEventListener('message', _onMessage, false);
        },
        /**
         * Destructor of the class
         */
        destroy: function () {
            _msgCb = null;
            cfg.worker.removeEventListener('message', _onMessage, false);
        }
    };
};