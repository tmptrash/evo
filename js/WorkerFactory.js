/**
 * WEB Workers helper. Creates Web workers for organisms and
 * loads all dependencies (Interpreter, Mutator,...) into
 * one Blob object. This Blob object is passed to the workers
 * through dynamic URL as one script. This is how worker may
 * run all needed functions and classes inside. This class
 * only create workers. It doesn't communicate with organisms
 * inside the worker. There is special class, which do the
 * communication - Communicator.
 *
 * Dependencies:
 *     $script.js
 *     jQuery
 *     Evo
 *
 * @param {Object}   cfg Configuration of the Worker
 *        {Function} cb  Ready callback. Will be called when
 *                       Worker will be ready (initialized).
 *
 * @author DeadbraiN
 */
Evo.WorkerFactory = function WorkerFactory(cfg) {
    /**
     * @constant
     * {Array} Files, which are needed for organism. They
     * will be packed into one blob object. Very important
     * that every file must contain one class (function)
     * inside and this class should be called in a same
     * way like name of the file. Example: Evo.js -> Evo
     * class, Mutator.js -> Evo.Mutator class. The order
     * of files is important. The last file in this list
     * should be a communicator class, because application
     * should somehow communicate with with Worker.
     */
    var _BLOB_FILES = [
        'js/Interpreter.js',
        'js/Mutator.js',
        'js/Code2Text.js',
        'js/Organism.js',
        'js/Communicator.js'
    ];
    /**
     * @constant
     * {String} String query to the container, which contain
     * dynamic script tags. These scripts are used for
     * organisms workers and Blob object creation.
     */
    var _SCRIPTS_QUERY = 'scripts script';

    /**
     * {String} An URL of the Blob object, which is contained
     * all javascript dependencies for organism living.
     */
    var _blobUrl = null;
    /**
     * {Boolean} It will be set to true, when Evo app will be
     * ready. It means all asynchronous actions will be done.
     */
    var _ready = false;

    /**
     * Creates initial script, which runs web worker.
     * @return {String} Script in string format
     */
    function _getFinalScript() {
        return 'var com = new Evo.Communicator();';
    }
    /**
     * Loads all dependencies for organism and pack them into
     * the one string. Creates Blob object with this string inside
     * and set it's URL for future workers. Worker class will be
     * ready only after cfg.cb() will be called.
     * @private
     */
    function _init() {
        //
        // $script library loads all script files asynchronously
        //
        // TODO: it should be rewritten with importScripts() method
        // TODO: It will be shorter and without jQuery
        $script(_BLOB_FILES, function() {
            var scripts = $(_SCRIPTS_QUERY);
            var files   = '';
            var fileRe  = /\/([a-zA-Z-\._0-9]+)\.js/;
            var file;
            var i;
            var l;

            for (i = 0, l = scripts.length; i < l; i++) {
                //
                // Only file name (without extension)
                //
                file = fileRe.exec(scripts[i].src)[1];
                //
                // Here we get inner function. Every file should
                // contain a function inside. It must has the same
                // name like file name.
                //
                files += (Evo[file] || window[file]).toString();
            }
            files += _getFinalScript();
            //
            // Old Blob object will be removed after page reload
            //
            _blobUrl = window.URL.createObjectURL(new Blob([files]));
            //
            // Removes all dynamically added scripts
            //
            $(_SCRIPTS_QUERY).remove();
            //
            // Calls the callback, which means that Worker is ready
            //
            if ($.isFunction(cfg.cb)) {
                cfg.cb();
            }
            _ready = true;
        });
    }

    //
    // This is how web worker is initialized
    //
    _init();

    return {
        /**
         * Creates new Web Worker with organism inside. All
         * required scripts are already inside worker.
         * @return {Worker|String}
         */
        create: function () {
            if (!_ready) {
                return 'The worker is not ready';
            }

            return new Worker(_blobUrl);
        }
    };
};