/**
 * Global Evo configuration
 *
 * Dependencies:
 *     No
 *
 * @author DeadbraiN
 */
this.Evo = {
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
     * {Number} Default padding for human readable scripts
     */
    CODE_PADDING: 5,
    /**
     * {Number} Coefficient of new mutations. It means, that
     * it directly affects on binary script growing. New mutation
     * probability is: 1/(codeLen * _NEW_MUTATIONS_SPEED). So it
     * depends on size of binary script and speed of client PC.
     * As big this number is as slow the script is grow.
     */
    NEW_MUTATIONS_SPEED: 1,
    /**
     * {Number} Amount of non interruptable iterations between
     * user commands from console. This parameter affects on
     * speed of used command response time. If this parameter
     * is big, then background calculations will be long and
     * user commands processing will be delayed. It depends
     * on current PC performance.
     */
    BLOCKING_ITERATIONS: 50000,
    /**
     * {Number} Size of organism's memory in words (2 * MEMORY_SIZE bytes)
     */
    MEMORY_SIZE: 100
};