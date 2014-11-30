describe("World", function() {
  it('Tests world creation', function() {
    var hasError = false;
    //
    // This is how we catch all errors
    //
    window.onerror = function () {hasError = true;};
    var world = new Evo.World({noFullscreen: true});
    expect(hasError).toBeFalsy();
  });
  it('Tests noFullscreen:true config', function() {
    var world = new Evo.World({noFullscreen: true});
    expect($('#world').width() !== $('body').width).toBeTruthy();
  });
  it('Tests noFullscreen:false config', function() {
    var worldEl = $('#world');
    var world   = new Evo.World({noFullscreen: false});
    expect(worldEl.width() === $('body').width()).toBeTruthy();
    worldEl.attr('width', 0).attr('height', 0);
  });
});
