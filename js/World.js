/**
 * The world for organisms. 2D canvas in a browser, where all organisms
 * are living. It handles coordinates, pixels and they colors on canvas.
 * This class requires a canvas tag in a code
 *
 * Dependencies:
 *     jQuery
 *     Evo
 *
 * @param {Object}   cfg          Class configuration
 *        {Boolean=} noFullscreen If true, then canvas will be not stretched fullscreen
 *        {String=}  query        Query to the canvas tag in DOM
 *
 * @author DeadbraiN
 */
Evo.World = function World(cfg) {
    /**
     * {Object} Default class configuration. Will be overridden by user config
     */
    var _cfg          = {
        /**
         * {String} Query to the canvas tag for our world
         */
        canvasQuery : '#world',
        /**
         * {Boolean} By default canvas tag should be on full screen
         */
        noFullscreen: false
    };
    /**
     * {HTMLElement} Canvas DOM element
     */
    var _canvasEl     = $(cfg && cfg.canvasQuery || _cfg.canvasQuery);
    /**
     * {CanvasRenderingContext2D} Context of 2D canvas. It's needed for
     * pixels manipulations.
     */
    var _ctx          = null;
    /**
     * {ImageData} Special object, which is used for one pixel
     * manipulations like getPixel()/setPixel() methods call.
     */
    var _imgData      = null;
    /**
     * {Array} Reference to ImageData.data for performance issue
     */
    var _data         = null;


    /**
     * Internal canvas initialization. Should be called before creation
     * @private
     */
    function _init() {
        _applyConfigs();
        _checkConfigs();
        _bindEvents();
        _updateCanvasSize();
        _prepareCanvas();
    }
    /**
     * Applies user configuration into default one. Final config
     * is available in _cfg field.
     */
    function _applyConfigs() {
        for (var i in cfg) {
            if (cfg.hasOwnProperty(i)) {
                _cfg[i] = cfg[i];
            }
        }
    }
    /**
     * Checks initial configuration. In case of error shows it in the console
     */
    function _checkConfigs() {
        if (!_canvasEl.length) {
            throw new Error('Canvas element hasn\'t found. Please fix World.canvasQuery configuration.');
        }
        if (!$.isFunction(_canvasEl[0].getContext)) {
            throw new Error('Canvas element is invalid or your browser doesn\'t support it. Please fix World.canvasQuery configuration or change the browser to Google Chrome.');
        }
        if (_canvasEl.length > 1) {
            console.info('There are many canvas tags on a page. Please fix World.canvasQuery configuration. First tag will be used.');
        }
    }
    /**
     * Binds all class related events
     */
    function _bindEvents() {
        $(window).on('resize', _updateCanvasSize);
    }
    /**
     * Prepares canvas container and internal variables for drawing pixels
     */
    function _prepareCanvas() {
        //
        // This data will be used for pixels access
        //
        _imgData = _ctx.createImageData(1, 1);
        _data    = _imgData.data;
        //
        // Alpha channel should be in maximum value
        //
        _data[3] = 255;
    }
    /**
     * Updates canvas size depending of browser width and height
     * @private
     */
    function _updateCanvasSize() {
        var bodyEl = $('body');

        if (!_cfg.noFullscreen) {
            _canvasEl.attr('width', bodyEl.width());
            _canvasEl.attr('height', bodyEl.height());
        }
        _ctx = _canvasEl[0].getContext('2d');
    }


    //
    // Entry point of this class
    //
    _init();


    return {
        /**
         * Returns a color of the pixel with specified coordinates.
         * By color i mean rgb combined number. For example: white
         * color #FFFFFF is 16777215 in decimal. Decimal value will
         * be returned.
         * @param {Number} x X coordinate
         * @param {Number} y Y coordinate
         * @return {Number} Color for these coordinates
        */
        getPixel: function (x, y) {
            var data = _ctx.getImageData(x, y, 1, 1).data;
            return (data[0] << 16) + (data[1] << 8) + data[2];
        },
        /**
         * Sets pixel to specified color with specified coordinates.
         * Color should contain red, green and blue components in one
         * decimal number. For example: 16777215 is #FFFFFF - white.
         * @param {Number} x X coordinate
         * @param {Number} y Y coordinate
         * @param {Number} c Decimal color
         */
        setPixel: function (x, y, c) {
            var data = _data;
            data[0] = (c >> 16) & 255;
            data[1] = (c >> 8) & 255;
            data[2] = c & 255;
            _ctx.putImageData(_imgData, x, y);
        }
    };
};