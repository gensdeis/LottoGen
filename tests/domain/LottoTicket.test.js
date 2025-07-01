import { describe, it, expect } from '@jest/globals';
import { LottoTicket } from '../../src/domain/LottoTicket.js';
import { LottoNumber } from '../../src/domain/LottoNumber.js';

describe('LottoTicket', () => {
  describe('생성', () => {
    it('6개의 유효한 번호로 생성할 수 있다', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const ticket = new LottoTicket(numbers);
      
      expect(ticket.numbers).toHaveLength(6);
      expect(ticket.numbers.map(n => n.value)).toEqual(numbers);
    });

    it('6개가 아닌 번호로 생성시 에러가 발생한다', () => {
      expect(() => new LottoTicket([1, 2, 3, 4, 5])).toThrow('로또 티켓은 정확히 6개의 번호가 필요합니다.');
      expect(() => new LottoTicket([1, 2, 3, 4, 5, 6, 7])).toThrow('로또 티켓은 정확히 6개의 번호가 필요합니다.');
    });

    it('중복된 번호로 생성시 에러가 발생한다', () => {
      expect(() => new LottoTicket([1, 2, 3, 4, 5, 5])).toThrow('로또 번호는 중복될 수 없습니다.');
    });

    it('LottoNumber 객체 배열로도 생성할 수 있다', () => {
      const numbers = [1, 2, 3, 4, 5, 6].map(n => new LottoNumber(n));
      const ticket = new LottoTicket(numbers);
      
      expect(ticket.numbers).toHaveLength(6);
      expect(ticket.numbers[0]).toBeInstanceOf(LottoNumber);
    });
  });

  describe('기능', () => {
    it('번호들이 오름차순으로 정렬된다', () => {
      const ticket = new LottoTicket([6, 3, 1, 5, 2, 4]);
      const sortedValues = ticket.numbers.map(n => n.value);
      
      expect(sortedValues).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('특정 번호 포함 여부를 확인할 수 있다', () => {
      const ticket = new LottoTicket([1, 2, 3, 4, 5, 6]);
      
      expect(ticket.contains(new LottoNumber(3))).toBe(true);
      expect(ticket.contains(new LottoNumber(10))).toBe(false);
    });

    it('문자열로 변환할 수 있다', () => {
      const ticket = new LottoTicket([6, 3, 1, 5, 2, 4]);
      
      expect(ticket.toString()).toBe('1, 2, 3, 4, 5, 6');
    });
  });
}); 