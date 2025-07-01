import { describe, it, expect } from '@jest/globals';
import { LottoNumber } from '../../src/domain/LottoNumber.js';

describe('LottoNumber', () => {
  describe('생성', () => {
    it('유효한 번호(1-45)로 생성할 수 있다', () => {
      const number = new LottoNumber(1);
      expect(number.value).toBe(1);
      
      const number45 = new LottoNumber(45);
      expect(number45.value).toBe(45);
    });

    it('범위를 벗어난 번호로 생성시 에러가 발생한다', () => {
      expect(() => new LottoNumber(0)).toThrow('로또 번호는 1부터 45까지만 유효합니다.');
      expect(() => new LottoNumber(46)).toThrow('로또 번호는 1부터 45까지만 유효합니다.');
      expect(() => new LottoNumber(-1)).toThrow('로또 번호는 1부터 45까지만 유효합니다.');
    });

    it('숫자가 아닌 값으로 생성시 에러가 발생한다', () => {
      expect(() => new LottoNumber('abc')).toThrow('로또 번호는 숫자여야 합니다.');
      expect(() => new LottoNumber(null)).toThrow('로또 번호는 숫자여야 합니다.');
      expect(() => new LottoNumber(undefined)).toThrow('로또 번호는 숫자여야 합니다.');
    });
  });

  describe('동등성 비교', () => {
    it('같은 값을 가진 번호는 동등하다', () => {
      const number1 = new LottoNumber(10);
      const number2 = new LottoNumber(10);
      
      expect(number1.equals(number2)).toBe(true);
    });

    it('다른 값을 가진 번호는 동등하지 않다', () => {
      const number1 = new LottoNumber(10);
      const number2 = new LottoNumber(20);
      
      expect(number1.equals(number2)).toBe(false);
    });
  });
}); 