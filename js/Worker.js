/**
 * This module is used for communication between application
 * and the Organism. As you know only messages mechanism is
 * supported. So it should support some kind of remote
 * procedures calls API. Also, please note, that this class
 * is created inside the worker and it has an access to the
 * organism instance.
 * Don't forget that importScript() method is synchronous!
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
     * and returns the the message.
     * @param {MessageEvent} e
     *        {String}  cmd Command (name of the method) to run.
     *        {Object=} cfg Configuration for cmd
     *        {String}  id  Unique message id. Like transaction id.
     * @private
     */
    function _onMessage(e) {
        var data = e.data;
        debugger;
        if (data) {
            var resp = typeof _organism[data.cmd] === 'function' ? _organism[data.cmd](data.cfg) : 'Invalid command "' + data.cmd + '"';
            self.postMessage(resp, data.id);
        }
    }


    //
    // Worker starts listening main thread
    //
    self.addEventListener('message', _onMessage, false);
};