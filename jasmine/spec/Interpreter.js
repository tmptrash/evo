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
    it('tests codeLen config', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([0,1,0,0, 14,0,0,0]), codeLen: 4});
        expect(int.getOutput().length).toBe(0);
    });
    it('tests i config', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([0,1,0,0, 14,0,0,0]), i: 4});
        expect(int.getOutput()[0]).toBe(0);
    });
    it('tests set command', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([0,1,0,0])});
        expect(int.getVars()[0]).toBe(1);
        int.run({code: new Uint16Array([0,1,1,0])});
        expect(int.getVars()[1]).toBe(1);
        int.run({code: new Uint16Array([0,65535,2,0])});
        expect(int.getVars()[2]).toBe(65535);
    });
});