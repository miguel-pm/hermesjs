import { expect } from 'chai';
import { describe, it } from 'mocha';

import {
  isValid,
  isValidString,
  isValidNumber,
  isValidArray,
  isNonzeroUnsignedNum
} from '../hermes.validators';

describe('Common Validators Module', () => {
  describe('isValid function', () => {
    it('should return false is the input is either undefined or null and return true otherwise', () => {
      const expectedFalses = [
        isValid(null),
        isValid(undefined)
      ];
      const expectedTrues = [isValid('hello world')];
      expectedFalses.forEach(ef => { expect(ef).to.eq(false); });
      expectedTrues.forEach(ef => { expect(ef).to.eq(true); });
    });
  });
  describe('isValidString function', () => {
    it('should return true if the input is valid string', () => {
      const expectedTrues = [
        isValidString('hello world'),
        isValidString(`the sum is ${2 + 2}`)
      ];
      expectedTrues.forEach(ef => { expect(ef).to.eq(true); });
    });
    it('should return false if the input is undefined, null not a string or an empty string', () => {
      const expectedFalses = [
        isValidString(null),
        isValidString(undefined),
        isValidString(''),
        isValidString(123 as unknown as string)
      ];
      expectedFalses.forEach(ef => { expect(ef).to.eq(false); });
    });
  });
  describe('isValidNumber function', () => {
    it('should return false if the input is undefined, null, or not a valid number', () => {
      const expectedFalses = [
        isValidNumber(null),
        isValidNumber(undefined),
        isValidNumber('asdf')
      ];
      expectedFalses.forEach(ef => { expect(ef).to.eq(false); });
    });
    it('should return true if the input is a valid number value, even if in string form', () => {
      const expectedTrues = [
        isValidNumber(-1235),
        isValidNumber(`${12 + 67}`),
        isValidNumber(23.2334)
      ];
      expectedTrues.forEach(ef => { expect(ef).to.eq(true); });
    });
  });
  describe('isValidArray function', () => {
    it('should return false if the input is undefined, null, or not a valid array', () => {
      const expectedFalses = [
        isValidArray(null),
        isValidArray(undefined),
        isValidArray('asdf')
      ];
      expectedFalses.forEach(ef => { expect(ef).to.eq(false); });
    });
    it('should return true if the input is a valid array of any value, even if empty', () => {
      const expectedTrues = [
        isValidArray([]),
        isValidArray(['hello']),
        isValidArray(Array(10)),
        isValidArray(Array(10).fill(null))
      ];
      expectedTrues.forEach(ef => { expect(ef).to.eq(true); });
    });
  });
  describe('isNonzeroUnsignedNum function', () => {
    it('should return false if the input is not a valid number or if it is a lte 0 one', () => {
      const expectedFalses = [
        isNonzeroUnsignedNum(null as unknown as number),
        isNonzeroUnsignedNum(undefined as unknown as number),
        isNonzeroUnsignedNum('0' as unknown as number),
        isNonzeroUnsignedNum(0),
        isNonzeroUnsignedNum(-123),
        isNonzeroUnsignedNum(-123.45)
      ];
      expectedFalses.forEach(ef => { expect(ef).to.eq(false); });
    });
    it('should return true is a valid number larger than zero, even in string form', () => {
      const expectedTrues = [
        isNonzeroUnsignedNum(123),
        isNonzeroUnsignedNum('123' as unknown as number),
        isNonzeroUnsignedNum(123.45),
        isNonzeroUnsignedNum('123.45' as unknown as number)
      ];
      expectedTrues.forEach(ef => { expect(ef).to.eq(true); });
    });
  });
});
