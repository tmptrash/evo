describe("Interpreter", function () {
    var int;

    it('tests it\'s creation', function () {
        expect(function () {int = new Evo.Interpreter();}).not.toThrow();
    });
    it('runs itself without parameters', function () {
        int = new Evo.Interpreter();
        expect(function () {int.run();}).not.toThrow();
    });
    it('runs simple script', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([0,1,0,0, 14,0,0,0])});
        expect(int.getOutput()[0]).toBe(1);
    });
});