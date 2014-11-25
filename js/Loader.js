/**
 * Loads all needed JavaScript files for one organism
 *
 * @author DeadbraiN
 */
(function () {
    importScripts.apply(null, [
        'Evo.js',
        'Interpreter.js',
        'Mutator.js',
        'Code2Text.js',
        'Organism.js',
        'Communicator.js'
    ]);
    Evo.Communicator();
})();