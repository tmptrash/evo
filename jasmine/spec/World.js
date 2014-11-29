describe("World", function() {
  var world;

  beforeEach(function() {
    world = new Evo.World({noFullscreen: true});
  });

  it("Just a test", function() {
    expect(1).toEqual(1);
  });
});
