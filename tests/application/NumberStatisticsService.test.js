import { describe, it, expect, beforeEach } from '@jest/globals';
import { NumberStatisticsService } from '../../src/application/NumberStatisticsService.js';
import { DrawResult } from '../../src/domain/DrawResult.js';

describe('NumberStatisticsService', () => {
  let service;
  let mockDrawResults;

  beforeEach(() => {
    service = new NumberStatisticsService();
    
    // 테스트용 모킹 데이터 (간단한 패턴)
    mockDrawResults = [
      new DrawResult(1, [1, 2, 3, 4, 5, 6], 7),
      new DrawResult(2, [1, 2, 8, 9, 10, 11], 12),
      new DrawResult(3, [1, 13, 14, 15, 16, 17], 18),
      new DrawResult(4, [2, 19, 20, 21, 22, 23], 24),
      new DrawResult(5, [1, 2, 25, 26, 27, 28], 29)
    ];
  });

  describe('번호 출현 빈도 분석', () => {
    it('각 번호의 출현 횟수를 계산할 수 있다', () => {
      const frequency = service.calculateFrequency(mockDrawResults);
      
      // 1번이 3번, 2번이 3번 나옴
      expect(frequency.get(1)).toBe(3);
      expect(frequency.get(2)).toBe(3);
      expect(frequency.get(3)).toBe(1);
      expect(frequency.get(30)).toBeUndefined(); // 없는 번호
    });

    it('가장 자주 나온 번호들을 반환할 수 있다', () => {
      const topNumbers = service.getMostFrequentNumbers(mockDrawResults, 5);
      
      expect(topNumbers).toHaveLength(5);
      expect(topNumbers[0].number).toBe(1); // 가장 많이 나온 번호
      expect(topNumbers[0].frequency).toBe(3);
      expect(topNumbers[1].number).toBe(2);
      expect(topNumbers[1].frequency).toBe(3);
    });

    it('요청한 개수만큼 번호를 반환한다', () => {
      const topNumbers = service.getMostFrequentNumbers(mockDrawResults, 3);
      
      expect(topNumbers).toHaveLength(3);
    });
  });

  describe('빈 데이터 처리', () => {
    it('빈 배열을 전달하면 빈 결과를 반환한다', () => {
      const frequency = service.calculateFrequency([]);
      const topNumbers = service.getMostFrequentNumbers([], 5);
      
      expect(frequency.size).toBe(0);
      expect(topNumbers).toHaveLength(0);
    });
  });
}); 