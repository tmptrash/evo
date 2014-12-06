/**
 * This module is used for communication between application
 * and the Organism. As you know only messages mechanism is
 * supported. So it should support some kind of remote
 * procedures calls API. Also, please note, that this class
 * is created inside the worker and it has an access to the
 * organism instance.
 *
 * Dependencies:
 *     Evo
 *     Evo.Organism
 *
 * @author DeadbraiN
 */
Evo.Worker = function Worker() {
    /**
     * {Evo.Organism} Internal organism reference. Is used
     * for communicating between outside code and this worker.
     * We used simple formula: one organism per one web worker.
     */
    var _organism = new Evo.Organism();
    /**
     * Main thread messages receiver. Runs commands on organism
     * and returns answers through  postMessage(). Every message
     * from outside the Worker should contain at least two arguments:
     * command name and message id. Return command value will be
     * passed through answer message in resp parameter.
     * @param {MessageEvent} e.data
     *        {String}         cmd Command (name of the method) to run.
     *        {Object|String=} cfg Configuration for cmd
     *        {String}         id  Unique message id. Like transaction id.
     * @private
     */
    function _onMessage(e) {
        var data = e.data;
        var cmd;
        var validFn;
        var cfg;

        debugger;
        cmd     = _organism[data.cmd];
        validFn = typeof cmd === 'function';
        cfg     = typeof data.cfg === 'string' ? JSONfn.parse(data.cfg) : data.cfg;
        self.postMessage({
            resp: validFn ? cmd(cfg) : 'Invalid command "' + data.cmd + '"',
            id  : data.id
        });
    }


    //
    // Worker starts listening main thread
    //
    self.addEventListener('message', _onMessage, false);
};