import { describe, it, expect } from '@jest/globals';
import { DrawResult } from '../../src/domain/DrawResult.js';
import { LottoTicket } from '../../src/domain/LottoTicket.js';
import { LottoNumber } from '../../src/domain/LottoNumber.js';

describe('DrawResult', () => {
  describe('생성', () => {
    it('회차번호, 당첨번호, 보너스번호로 생성할 수 있다', () => {
      const drawNo = 1178;
      const winningNumbers = [1, 2, 3, 4, 5, 6];
      const bonusNumber = 7;
      
      const result = new DrawResult(drawNo, winningNumbers, bonusNumber);
      
      expect(result.drawNo).toBe(drawNo);
      expect(result.winningTicket).toBeInstanceOf(LottoTicket);
      expect(result.bonusNumber).toBeInstanceOf(LottoNumber);
      expect(result.bonusNumber.value).toBe(bonusNumber);
    });

    it('잘못된 회차번호로 생성시 에러가 발생한다', () => {
      expect(() => new DrawResult(0, [1, 2, 3, 4, 5, 6], 7)).toThrow('회차번호는 1 이상이어야 합니다.');
      expect(() => new DrawResult(-1, [1, 2, 3, 4, 5, 6], 7)).toThrow('회차번호는 1 이상이어야 합니다.');
    });

    it('보너스번호가 당첨번호와 중복시 에러가 발생한다', () => {
      expect(() => new DrawResult(1178, [1, 2, 3, 4, 5, 6], 6))
        .toThrow('보너스번호는 당첨번호와 중복될 수 없습니다.');
    });
  });

  describe('기능', () => {
    it('모든 번호(당첨번호 + 보너스번호)를 반환할 수 있다', () => {
      const result = new DrawResult(1178, [1, 2, 3, 4, 5, 6], 7);
      const allNumbers = result.getAllNumbers();
      
      expect(allNumbers).toHaveLength(7);
      expect(allNumbers.map(n => n.value)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('특정 번호가 포함되어 있는지 확인할 수 있다', () => {
      const result = new DrawResult(1178, [1, 2, 3, 4, 5, 6], 7);
      
      expect(result.contains(new LottoNumber(3))).toBe(true);
      expect(result.contains(new LottoNumber(7))).toBe(true);
      expect(result.contains(new LottoNumber(10))).toBe(false);
    });
  });
}); 