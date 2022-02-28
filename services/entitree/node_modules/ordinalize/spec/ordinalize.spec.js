const ordinalize = require('../ordinalize');

describe("ordinalize function", function() {
    it("works with positive ints", function() {
        expect(ordinalize(-0)).toBe('0th');
        expect(ordinalize(0)).toBe('0th');
        expect(ordinalize(1)).toBe('1st');
        expect(ordinalize(2)).toBe('2nd');
        expect(ordinalize(3)).toBe('3rd');
        expect(ordinalize(11)).toBe('11th');
        expect(ordinalize(1e2)).toBe('100th');
        expect(ordinalize(10e3 * 10e-3)).toBe('100th');
    });
    it("return empty for negative ints", function() {
        expect(ordinalize(-1)).toBe('');
        expect(ordinalize(-2)).toBe('');
        expect(ordinalize(-3)).toBe('');
        expect(ordinalize(-11)).toBe('');
    });
    it("works with strings", function() {
        expect(ordinalize('-1')).toBe('');
        expect(ordinalize('rubbish')).toBe('');
        expect(ordinalize('2')).toBe('2nd');
        expect(ordinalize('3')).toBe('3rd');
        expect(ordinalize('11')).toBe('11th');
        expect(ordinalize('10e2')).toBe('1000th');
    });
});