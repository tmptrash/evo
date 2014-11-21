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
    var _n = 0;
    /**
     * TODO:
     * {Object} Map of organisms (Web workers) organized by id.
     */
    var _organisms = {};
    /**
     * {Boolean} It will be set to true, when Evo app will be
     * ready. It means all asynchronous actions will be done.
     */
    var _ready = false;
    /**
     * {Evo.Worker} Is used for Web Workers creation. Every
     * organism are in separate worker.
     */
    var _worker = new Evo.Worker({cb: function () {_ready = true;}});


    return {
        /**
         * Creates new organism with parameters
         * TODO:
         */
        create: function () {
            var id = _n++;

            if (!_ready) {
                return 'Evo is not ready. Please wait a second and try again.';
            }
            _organisms[id] = _worker.create();

            return id;
        },
        /**
         * TODO:
         */
        remove: function (id) {
            if (!_ready) {
                return 'Evo is not ready. Please wait a second and try again.';
            }
            if (!_organisms[id]) {
                return 'Invalid organism id';
            }
            _organisms[id].terminate();

            return 'done';
        },
        /**
         * TODO:
         */
        live: function (id, cfg) {
            if (!_ready) {
                return 'Evo is not ready. Please wait a second and try again.';
            }
            if (!_organisms[id]) {
                return 'Invalid organism id';
            }

            _organisms[id].postMessage('live', cfg);

            return 'done';
        }
    };
};