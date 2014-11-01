/**
 * TODO: Describe this module in details
 *
 * @author DeadbraiN
 */
Evo.Code2Text = (function () {
    /**
     * Adds spaces to the s string till width length
     * @param {String} s String to pad
     * @param {Number} width Width of string we need to obtain
     * @return {String}
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
         *     'v' - variable
         *     'n' - number
         *
         * @param {Uint16Array} code
         */
        convert: function (code) {
            var segs = Evo.LINE_SEGMENTS;
            var v    = 'v';
            var n    = 'n';
            var cmds = [
                [ 'set',   n, v    ],
                [ 'move',  v, v    ],
                [ 'inc',   v       ],
                [ 'dec',   v       ],
                [ 'add',   v, v    ],
                [ 'sub',   v, v    ],
                [ 'read',  v, v    ],
                [ 'write', v, v    ],
                [ 'jump',  n       ],
                [ 'jumpg', v, v, n ],
                [ 'jumpl', v, v, n ],
                [ 'jumpe', v, v, n ],
                [ 'jumpz', v, n    ],
                [ 'jumpn', v, n    ],
                [ 'echo',  v       ]
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
                    line.push(cmd[j] === v ? v + code[i + j] : code[i + j]);
                }
                strCode.push(line);
            }

            return strCode;
        },
        /**
         * Formats array of line arrays. Example:
         *
         *     [[cmd, arg1, arg2, arg3],...]
         *
         * @param {Array} code String based code lines. See example above
         * @param {Number} padWidth Width of one code line segment like: command or argument
         * @param {String=} separator Separator string between commands and args
         * @param {String=} newLine Symbol for lines break
         * @return {String} Lines of code separated by '\n\' symbol
         */
        formatLines: function (code, padWidth, separator, newLine) {
            var i;
            var l;

            padWidth  = padWidth  || 5;
            separator = separator || ' ';
            newLine   = newLine   || '\n';

            return code.map(function (line, idx) {
                for (i = 0, l = line.length; i < l; i++) {
                    line[i] = _pad(line[i], padWidth);
                }
                return _pad(idx + ':', 4) + line.join(separator);
            }).join(newLine);
        }
    };
})();