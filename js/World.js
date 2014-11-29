/**
 * The world for organisms. 2D canvas in a browser, where all organisms
 * are living. It handles coordinates, pixels and they colors on canvas.
 *
 * Dependencies:
 *     jQuery
 *     Evo
 *
 * @author DeadbraiN
 */
// TODO: describe config parameter
Evo.World = function World(config) {
    /**
     * {String} Query to the canvas tag for our world
     */
    var _CANVAS_QUERY = '#world';
    /**
     * {HTMLElement} Canvas DOM element
     */
    var _canvasEl     = $(_CANVAS_QUERY);
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
        config = config || {};

        $(window).on('resize', _updateCanvasSize);
        _updateCanvasSize();
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

        if (!config.noFullscreen) {
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