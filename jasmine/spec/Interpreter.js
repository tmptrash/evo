describe("Interpreter", function () {
    var int;

    //
    // Interpreter creation tests
    //
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
    //
    // Tests configurations
    //
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
    it('tests inCb config', function (done) {
        int = new Evo.Interpreter();
        // in v1,v1
        int.run({code: new Uint16Array([24,1,1,0]), inCb: function(cb, v) {
            setTimeout(function () {
                cb(v+2);
                expect(int.getVars()[1]).toBe(2);
                done();
            }, 0);
        }});
    });
    it('tests outCb config', function () {
        int = new Evo.Interpreter();
        // set 1,v1;  set 2,v2;  out v1,v2;
        int.run({code: new Uint16Array([0,1,1,0, 0,2,2,0, 25,1,2,0]), outCb: function(v1, v2) {
            expect(v1).toBe(1);
            expect(v2).toBe(2);
        }});
    });
    it('tests stepCb config', function (done) {
        int = new Evo.Interpreter();
        // set 1,v1;  step v1
        int.run({code: new Uint16Array([0,1,1,0, 26,1,0,0]), stepCb: function(cb, v) {
            expect(v).toBe(1);
            setTimeout(function () {
                // we just need to be here without checks
                cb();
                done();
            }, 0);
        }});
    });
    it('tests eatCb config', function () {
        int = new Evo.Interpreter();
        // set 1,v1;  set 2,v2;  eat v1,v2;
        int.run({code: new Uint16Array([0,1,1,0, 0,2,2,0, 27,1,2,0]), eatCb: function(v1, v2) {
            expect(v1).toBe(1);
            expect(v2).toBe(2);
        }});
    });
    it('tests cloneCb config', function () {
        int = new Evo.Interpreter();
        // set 1,v1;  clone v1;
        int.run({code: new Uint16Array([0,1,1,0, 28,1,0,0]), cloneCb: function(v1) {
            expect(v1).toBe(1);
        }});
    });
    it('tests echoCb config', function () {
        int = new Evo.Interpreter();
        // set 1,v1;  echo v1;
        int.run({code: new Uint16Array([0,1,1,0, 14,1,0,0]), echoCb: function(v1) {
            expect(v1).toBe(1);
        }});
    });
    //
    // Tests commands
    //
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
    it('tests add command', function () {
        int = new Evo.Interpreter();
        int.run({code: new Uint16Array([4,0,0,0])});
        expect(int.getVars()[0]).toBe(0);
        int.run({code: new Uint16Array([0,1,0,0, 4,0,0,0, 4,0,0,0])});
        expect(int.getVars()[0]).toBe(4);
        int.run({code: new Uint16Array([0,1,0,0, 4,0,0,0, 4,1,0,0])});
        expect(int.getVars()[0]).toBe(2);
        int.run({code: new Uint16Array([0,1,0,0, 4,0,0,0])});
        expect(int.getVars()[0]).toBe(2);
        expect(int.getVars()[1]).toBe(0);
        expect(int.getVars()[2]).toBe(0);
        int.run({code: new Uint16Array([0,65535,0,0, 0,1,1,0, 4,1,0,0])});
        expect(int.getVars()[0]).toBe(0);
        expect(int.getVars()[1]).toBe(1);
        expect(int.getVars()[2]).toBe(0);
        int.run({code: new Uint16Array([0,1,0,0, 4,0,0,1])});
        expect(int.getVars()[0]).toBe(2);
        int.run({code: new Uint16Array([0,2,0,0, 0,65535,1,0, 4,0,1,1])});
        expect(int.getVars()[0]).toBe(2);
        expect(int.getVars()[1]).toBe(1);
    });
});