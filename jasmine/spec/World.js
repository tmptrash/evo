describe("World", function() {
  var canvasQuery = '#world';
  var bodyEl      = $('body');
  var worldEl     = $(canvasQuery);

  it('tests it\'s creation without config', function() {
    var hasError = false;
    //
    // This is how we catch all errors
    //
    window.onerror = function () {hasError = true;};
    var world = new Evo.World();
    expect(hasError).toBeFalsy();
    $(canvasQuery).attr('width', 0).attr('height', 0);
  });
  it('tests it\'s creation without canvas tag', function() {
    var canvasEl = $(canvasQuery).detach();
    expect(function () {var world = new Evo.World();}).toThrow();
    $('body').append(canvasEl);
    $(canvasQuery).attr('width', 0).attr('height', 0);
  });
  it('tests it\'s creation with invalid canvas tag', function() {
    var canvasEl = bodyEl.append('<newtag/>');
    expect(function () {var world = new Evo.World({canvasQuery: 'newtag'});}).toThrow();
    bodyEl.append(canvasEl);
    $(canvasQuery).attr('width', 0).attr('height', 0);
    $('newtag').remove();
  });
  it('tests it\'s creation with noFullscreen:true config', function() {
    var world = new Evo.World({noFullscreen: true});
    expect($(canvasQuery).width() !== bodyEl.width).toBeTruthy();
    $(canvasQuery).attr('width', 0).attr('height', 0);
  });
  it('tests it\'s creation with noFullscreen:false config', function() {
    var world   = new Evo.World({noFullscreen: false});
    expect(worldEl.width() === bodyEl.width()).toBeTruthy();
    worldEl.attr('width', 0).attr('height', 0);
  });
  it('tests it\'s creation with invalid noFullscreen config', function() {
    var world   = new Evo.World({noFullscreen: {}});
    expect(worldEl.width() !== bodyEl.width()).toBeTruthy();
    worldEl.attr('width', 0).attr('height', 0);
  });
  it('tests it\'s creation with and valid canvasQuery config', function() {
    var world   = new Evo.World({canvasQuery: canvasQuery});
    expect(worldEl.width() === bodyEl.width()).toBeTruthy();
    worldEl.attr('width', 0).attr('height', 0);
  });
  it('tests it\'s creation with and invalid canvasQuery config', function() {
    expect(function () {var world = new Evo.World({canvasQuery: 'invalid-query'});}).toThrow();
    worldEl.attr('width', 0).attr('height', 0);
  });
  it('tests getPixel() method', function() {
    var ctx     = worldEl[0].getContext('2d');
    var imgData = ctx.createImageData(1, 1);
    var data    = imgData.data;
    var world   = new Evo.World();

    data[0] = 80;  // 0x50
    data[1] = 120; // 0x78
    data[2] = 250; // 0xFA
    data[3] = 255; // opaque 100%
    ctx.putImageData(imgData, 1, 1);

    expect(world.getPixel(1, 1)).toBe(5273850); // 0x5078FA
    // It checks if getPixel() doesn't change the pixel
    expect(world.getPixel(1, 1)).toBe(5273850); // 0x5078FA
    worldEl.attr('width', 0).attr('height', 0);
  });
  it('tests getPixel() method with invalid arguments', function() {
    var world = new Evo.World();

    world.setPixel(1, 1, 5273851);
    expect(function () {
      world.getPixel({}, {});
      world.getPixel([], []);
      world.getPixel(-1, -1);
      world.getPixel('1', '1');
      world.getPixel(null, null);
      world.getPixel(NaN, NaN);
    }).not.toThrow();
    worldEl.attr('width', 0).attr('height', 0);
  });
  it('tests setPixel() method', function() {
    var world   = new Evo.World();

    world.setPixel(1, 2, 5273850);
    expect(world.getPixel(1, 2)).toBe(5273850);
    worldEl.attr('width', 0).attr('height', 0);
  });
  it('tests setPixel() method with invalid arguments', function() {
    var world = new Evo.World();

    expect(function () {
      world.setPixel('1', '2', '12345');
      world.setPixel({}, {}, {});
      world.setPixel([], [], []);
      world.setPixel(NaN, NaN, NaN);
      world.setPixel(null, null, null);
    }).not.toThrow();
    worldEl.attr('width', 0).attr('height', 0);
  });
});