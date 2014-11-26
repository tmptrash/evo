/**
 * Loads all needed JavaScript files for one Worker(Organism).
 * It's used by application during Web Worker creation.
 * Remember, that this code works inside the worker. It doesn't
 * contain window object. Don't forget, that importScripts()
 * method is asynchronous!
 *
 * @author DeadbraiN
 */
debugger;
importScripts.apply(null, [
    'Evo.js',
    'Interpreter.js',
    'Mutator.js',
    'Code2Text.js',
    'Organism.js',
    'Worker.js'
]);
//
// This is an entry point of Web Worker
//
self.worker = new Evo.Worker();