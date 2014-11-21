/**
 * This is main namespace for Evo application. Contains
 * general interface for communication with organisms and
 * entire world.
 *
 * TODO: update general idea of the application
 *
 * Dependencies:
 *     No
 *
 * @author DeadbraiN
 */
Evo.App = function () {
    /**
     * {Array} Files, which are needed for organism. They
     * will be packed into one blob object. Very important
     * that every file must contain one class (function)
     * inside and this class should be called in a same
     * way like name of the file. Example: Evo.js -> Evo
     * class, Mutator.js -> Evo.Mutator class
     */
    var _BLOB_FILES = [
        'js/lib/lcs.js',
        'js/Interpreter.js',
        'js/Mutator.js',
        'js/Code2Text.js',
        'js/Organism.js'
    ];

    /**
     * Map of organisms (Web workers) organized by id.
     */
    // TODO:
    var _organisms = null;
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
     * Loads all dependencies for organism and pack them into
     * the one string. Creates Blob object with this string inside
     * and set it's URL for future workers.
     * @private
     */
    function _init() {
        //
        // $script library loads all script files asynchronously
        //
        $script(_BLOB_FILES, function() {
            var scripts = $('scripts script');
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

            _ready   = true;
            _blobUrl = window.URL.createObjectURL(new Blob([files]));

            //
            // Removes all dynamically added scripts
            //
            $('scripts').empty();
        });
    }

    /**
     * This is an entry point of application. All other public
     * methods will be available a little bit later.
     */
    _init();

    return {
        /**
         * Creates new organism with parameters
         * TODO:
         */
        create: function () {
            if (!_ready) {
                return 'Evo is not ready. Please wait a second and try again.';
            }
        }
    };
};