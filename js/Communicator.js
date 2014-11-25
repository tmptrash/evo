/**
 * This class is used for communicate between application
 * and specified Web Worker. As you know only messages
 * mechanism is supported. So it should support some kind
 * of remote procedures calls API. Also, please note, that
 * this class is created inside the worker and it has an
 * access to the organism instance.
 *
 * @author DeadbraiN
 */
Evo.Communicator = function Communicator() {
    /**
     * {Evo.Organism} Internal organism reference. Is used
     * for communicating between outside code and this worker.
     * TODO: solve configuration issue. I think configuration
     * TODO: should be passed in live() method, but not in
     * TODO: the constructor.
     */
    var _organism = new Evo.Organism();

    /**
     * Main thread messages receiver. Runs commands on organism
     * and returns the the message.
     * @param {MessageEvent}  e
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
    // Entry point of this class
    //
    self.addEventListener('message', _onMessage, false);
};