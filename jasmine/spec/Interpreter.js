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
        int.run({code: new Uint16Array([0,1,0,0])});
        expect(int.getVars()[0]).toBe(1);
    });
    it('tests codeLen config', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([0,1,0,0, 0,2,0,0]), codeLen: 4});
        expect(int.getVars()[0]).toBe(1);
        int.run({code: new Uint16Array([0,1,0,0, 0,2,0,0])});
        expect(int.getVars()[0]).toBe(2);
    });
    it('tests i config', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([0,1,0,0, 0,2,0,0]), i: 4});
        expect(int.getVars()[0]).toBe(2);
        int.run({code: new Uint16Array([0,1,0,0, 0,2,0,0])});
        expect(int.getVars()[0]).toBe(2);
    });
    it('tests set command', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([0,1,0,0])});
        expect(int.getVars()[0]).toBe(1);
        int.run({code: new Uint16Array([0,1,1,0])});
        expect(int.getVars()[1]).toBe(1);
        int.run({code: new Uint16Array([0,65535,2,0])});
        expect(int.getVars()[2]).toBe(65535);
        int.run({code: new Uint16Array([0,65536,3,0])});
        expect(int.getVars()[3]).toBe(0);
        int.run({code: new Uint16Array([0,65537,4,0])});
        expect(int.getVars()[4]).toBe(1);
        int.run({code: new Uint16Array([0,-1,5,0])});
        expect(int.getVars()[5]).toBe(65535);
        int.run({code: new Uint16Array([0,1,6,1])});
        expect(int.getVars()[6]).toBe(1);
    });
    it('tests move command', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([1,0,1,0])});
        expect(int.getVars()[0]).toBe(0);
        expect(int.getVars()[1]).toBe(0);
        int.run({code: new Uint16Array([0,1,0,0, 1,0,1,0])});
        expect(int.getVars()[0]).toBe(1);
        expect(int.getVars()[1]).toBe(1);
        int.run({code: new Uint16Array([0,1,2,0, 1,2,2,0])});
        expect(int.getVars()[2]).toBe(1);
        int.run({code: new Uint16Array([0,1,1,0, 1,1,2,3])});
        expect(int.getVars()[1]).toBe(1);
        expect(int.getVars()[2]).toBe(1);
    });
    it('tests inc command', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([2,0,0,0])});
        expect(int.getVars()[0]).toBe(1);
        int.run({code: new Uint16Array([2,0,0,0, 2,0,0,0])});
        expect(int.getVars()[0]).toBe(2);
        int.run({code: new Uint16Array([2,0,0,0, 2,1,0,0])});
        expect(int.getVars()[0]).toBe(1);
        expect(int.getVars()[1]).toBe(1);
        int.run({code: new Uint16Array([2,0,0,0])});
        expect(int.getVars()[0]).toBe(1);
        expect(int.getVars()[1]).toBe(0);
        expect(int.getVars()[2]).toBe(0);
        int.run({code: new Uint16Array([2,0,1,2])});
        expect(int.getVars()[0]).toBe(1);
        expect(int.getVars()[1]).toBe(0);
        expect(int.getVars()[2]).toBe(0);
    });
    it('tests dec command', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([3,0,0,0])});
        expect(int.getVars()[0]).toBe(65535);
        int.run({code: new Uint16Array([3,0,0,0, 3,0,0,0])});
        expect(int.getVars()[0]).toBe(65534);
        int.run({code: new Uint16Array([0,1,0,0, 3,0,0,0, 3,1,0,0])});
        expect(int.getVars()[0]).toBe(0);
        expect(int.getVars()[1]).toBe(65535);
        int.run({code: new Uint16Array([0,1,0,0, 3,0,0,0])});
        expect(int.getVars()[0]).toBe(0);
        expect(int.getVars()[1]).toBe(0);
        expect(int.getVars()[2]).toBe(0);
        int.run({code: new Uint16Array([3,0,1,2])});
        expect(int.getVars()[0]).toBe(65535);
        expect(int.getVars()[1]).toBe(0);
        expect(int.getVars()[2]).toBe(0);
    });
});