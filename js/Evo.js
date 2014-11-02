/**
 * This is main namespace for Evo application. Contains main
 * definitions and configurations for entire application.
 * General idea of application is to develop an organism,
 * which is clever and may teach itself. Teaching is a result
 * of random mutations of the code. Eny new version of code
 * should pass current and all previous tests (see data sets
 * in Evo.Data). The idea is similar to biological evolution,
 * where organism may be changed by mutations and only it's
 * adopted versions will survive in some specific environment.
 * For us the organism is a program, which is written on
 * special assembler like language (Evo). This program looks
 * like a binary code. Special Mutator module may change this
 * code in a random way. If some version may pass all the tests,
 * then we think, that current organism is done.
 *
 * Dependencies:
 *     No
 *
 * @author DeadbraiN
 */
window.Evo = {
    /**
     * {Number} Maximum number value for organism. This is a value,
     * which our organism may proceed. It also understandable for
     * Interpreter and Mutator.
     */
    MAX_NUMBER: 65535,
    /**
     * {Number} Amount of segments in one binary script line:
     * command arg1 arg2 arg3
     */
    LINE_SEGMENTS: 4,
    /**
     * {String} The color of text of input and output data
     */
    COLOR_DATA: '#AA0000',
    /**
     * {String} The color of script
     */
    COLOR_CODE: '#707070',
    /**
     * {String} Color of final done message
     */
    COLOR_FINAL: '#00AA00'
};