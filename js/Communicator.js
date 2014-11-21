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
Evo.Communicator = function () {
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
     * @param {String} cmd Command (name of the method) to run.
     * @param {Object=} cfg Configuration for cmd
     * @param {String} id Unique message id. Like transaction id.
     * @private
     */
    function _onMessage(cmd, cfg, id) {
        var msg = id + ': ' +
            (typeof _organism[cmd] === 'function' ? _organism[cmd](cfg) : 'Invalid command "' + cmd + '"');

        self.postMessage(msg);
    }


    //
    // Entry point of this class
    //
    self.addEventListener('message', _onMessage, false);
};