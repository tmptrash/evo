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


    return {
        /**
         * Creates new organism with parameters in separate Web
         * Worker and starts worker immediately.
         * @return {Number} Unique worker id
         */
        create: function () {
            _organisms[_workerId] = new Worker('js/Loader.js');
            return _workerId++;
        },
        /**
         * TODO:
         */
        remove: function (id) {
            if (!_organisms[id]) {
                return 'Invalid organism id';
            }
            _organisms[id].terminate();
            delete _organisms[id];

            return 'done';
        },
        /**
         * TODO:
         */
        live: function (id, cfg) {
            if (!_organisms[id]) {
                return 'Invalid organism id';
            }

            // TODO: think about response handling
            _organisms[id].postMessage({
                // TODO: add all callback configs inCb, outCb,...
                cmd: 'live',
                cfg: cfg,
                id : ++_msgId
            });

            return 'done';
        }
    };
};