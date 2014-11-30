describe("World", function() {
  var canvasQuery = '#world';

  it('Tests world creation', function() {
    var hasError = false;
    //
    // This is how we catch all errors
    //
    window.onerror = function () {hasError = true;};
    var world = new Evo.World({noFullscreen: true});
    expect(hasError).toBeFalsy();
    $(canvasQuery).attr('width', 0).attr('height', 0);
  });
  it('Tests noFullscreen:true config', function() {
    var world = new Evo.World({noFullscreen: true});
    expect($(canvasQuery).width() !== $('body').width).toBeTruthy();
    $(canvasQuery).attr('width', 0).attr('height', 0);
  });
  it('Tests noFullscreen:false config', function() {
    var worldEl = $(canvasQuery);
    var world   = new Evo.World({noFullscreen: false});
    expect(worldEl.width() === $('body').width()).toBeTruthy();
    worldEl.attr('width', 0).attr('height', 0);
  });
  it('Tests noFullscreen config with invalid value', function() {
    var worldEl = $(canvasQuery);
    var world   = new Evo.World({noFullscreen: {}});
    expect(worldEl.width() !== $('body').width()).toBeTruthy();
    worldEl.attr('width', 0).attr('height', 0);
  });
  it('Tests valid query config', function() {
    var worldEl = $(canvasQuery);
    var world   = new Evo.World({canvasQuery: canvasQuery});
    expect(worldEl.width() === $('body').width()).toBeTruthy();
    worldEl.attr('width', 0).attr('height', 0);
  });
  it('Tests invalid query config', function() {
    var worldEl = $(canvasQuery);
    expect(function () {var world = new Evo.World({canvasQuery: 'invalid-query'});}).toThrow();
    worldEl.attr('width', 0).attr('height', 0);
  });
});
