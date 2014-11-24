/**
 * Main idea of this module is to convert binary script to human
 * readable assembler like text. For example, code like this:
 *
 *     0001 0002 0003
 *
 * Will be converted to:
 *
 *     move v2 v3
 *
 * Depending on parameters convert() method returns array,
 * string or outputs the code with console. During convertation
 * you may use padding. Padding means adding spaces at the end
 * of source string if it's length is less then specified width.
 * For example, string:
 *
 *     pad('set', 4);
 *
 * Will be transformed to:
 *
 *     'set '
 *
 * Dependencies:
 *     Evo
 *
 * @author DeadbraiN
 */
Evo.Code2Text = function Code2Text() {
    /**
     * Adds spaces to s string if the length of this string
     * is less then width.
     * @param {String} s String to pad
     * @param {Number} width Width of string we need to obtain
     * @return {String} Padded string
     */
    function _pad(s, width) {
        var i;
        var space = ' ';

        for (i = (s + '').length; i < width; i++) {
            s += space;
        }

        return s;
    }

    return {
        /**
         * Converts binary script into human readable code. Example:
         *
         *     0000 0001 0002 -> set 1 v2
         *
         * There are some names are supported:
         *
         *     'v' - variable index
         *     'n' - number
         *     'l' - line number
         *
         * @param {Uint16Array} code Binary script
         * @return {Array} Array of lines. Every line is an
         * array of segments. Example:
         *
         *     [['set', '123', '1'],...]
         *
         */
        convert: function (code) {
            var segs    = Evo.LINE_SEGMENTS;
            var v       = 'v'; // variable name
            var n       = 'n'; // number
            var l       = 'l'; // line number
            var cmds    = [
                [ 'set',   n, v    ],
                [ 'move',  v, v    ],
                [ 'inc',   v       ],
                [ 'dec',   v       ],
                [ 'add',   v, v    ],
                [ 'sub',   v, v    ],
                [ 'read',  v, v    ],
                [ 'write', v, v    ],
                [ 'jump',  l       ],
                [ 'jumpg', v, v, l ],
                [ 'jumpl', v, v, l ],
                [ 'jumpe', v, v, l ],
                [ 'jumpz', v, l    ],
                [ 'jumpn', v, l    ],
                [ 'echo',  v       ],
                [ 'or',    v, v    ],
                [ 'and',   v, v    ],
                [ 'xor',   v, v    ],
                [ 'not',   v, v    ],
                [ 'mul',   v, v    ],
                [ 'div',   v, v    ],
                [ 'rem',   v, v    ],
                [ 'shl',   v, v    ],
                [ 'shr',   v, v    ]
            ];
            var strCode = [];
            var line;
            var i;
            var iLen;
            var j;
            var jLen;
            var cmd;

            //
            // Goes by code lines and converts each line according to cmds config
            //
            for (i = 0, iLen = code.length; i < iLen; i += segs) {
                cmd  = cmds[code[i]]; // one command from cmds array
                line = [];            // one final human readable line
                line.push(cmd[0]);    // human readable command name
                //
                // Goes by one command from cmds array and
                // converts binary code to human
                //
                for (j = 1, jLen = cmd.length; j < jLen; j++) {
                    switch (cmd[j]) {
                        case v:
                            line.push(v + code[i + j]);
                            break;
                        case l:
                            line.push(l + code[i + j] / segs);
                            break;
                        default:
                            line.push(code[i + j]);
                            break;
                    }
                }
                strCode.push(line);
            }

            return strCode;
        },
        /**
         * Formats array of lines into human readable string. Example:
         *
         *     [['set', 3, 2]] -> 'set 3   v2  '
         *
         * @param {Array} code String based code lines. See example above
         * @param {Number=} padWidth Width of one code line segment like
         * command or argument. Evo.CODE_PADDING by default.
         * @param {Boolean=} noLines true to hide line numbers, false - by default
         * @param {String=} separator Separator string between commands
         * and args. ' ' by default.
         * @param {String=} newLine Symbol for lines break. '\n' by default.
         * @return {String} Lines of code separated by '\n' symbol
         */
        format: function (code, padWidth, noLines, separator, newLine) {
            var i;
            var l;

            padWidth  = padWidth  || Evo.CODE_PADDING;
            separator = separator || ' ';
            newLine   = newLine   || '\n';

            return code.map(function (line, idx) {
                for (i = 0, l = line.length; i < l; i++) {
                    line[i] = _pad(line[i], padWidth);
                }
                return (noLines ? '' : _pad(idx + ':', padWidth)) + line.join(separator);
            }).join(newLine);
        }
    };
};