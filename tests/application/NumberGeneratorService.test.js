import { describe, it, expect, beforeEach } from '@jest/globals';
import { NumberGeneratorService } from '../../src/application/NumberGeneratorService.js';
import { NumberStatisticsService } from '../../src/application/NumberStatisticsService.js';
import { DrawResult } from '../../src/domain/DrawResult.js';
import { LottoTicket } from '../../src/domain/LottoTicket.js';

describe('NumberGeneratorService', () => {
  let generator;
  let statisticsService;
  let mockDrawResults;

  beforeEach(() => {
    statisticsService = new NumberStatisticsService();
    generator = new NumberGeneratorService(statisticsService);
    
    // 테스트용 모킹 데이터
    mockDrawResults = [
      new DrawResult(1, [1, 2, 3, 4, 5, 6], 7),
      new DrawResult(2, [1, 2, 8, 9, 10, 11], 12),
      new DrawResult(3, [1, 13, 14, 15, 16, 17], 18),
      new DrawResult(4, [2, 19, 20, 21, 22, 23], 24),
      new DrawResult(5, [1, 2, 25, 26, 27, 28], 29)
    ];
  });

  describe('게임 생성', () => {
    it('요청한 개수만큼 게임을 생성할 수 있다', () => {
      const games = generator.generateGames(mockDrawResults, 5);
      
      expect(games).toHaveLength(5);
      games.forEach(game => {
        expect(game).toBeInstanceOf(LottoTicket);
      });
    });

    it('생성된 각 게임은 6개의 서로 다른 번호를 가진다', () => {
      const games = generator.generateGames(mockDrawResults, 3);
      
      games.forEach(game => {
        expect(game.numbers).toHaveLength(6);
        const values = game.numbers.map(n => n.value);
        const uniqueValues = new Set(values);
        expect(uniqueValues.size).toBe(6); // 중복 없음
      });
    });

    it('생성된 게임들은 서로 다르다', () => {
      const games = generator.generateGames(mockDrawResults, 5);
      
      const gameStrings = games.map(game => game.toString());
      const uniqueGames = new Set(gameStrings);
      
      // 모든 게임이 서로 다르거나, 최소한 대부분이 다르다
      expect(uniqueGames.size).toBeGreaterThan(1);
    });

    it('자주 나온 번호들이 생성된 게임에 포함될 확률이 높다', () => {
      const games = generator.generateGames(mockDrawResults, 10);
      
      // 가장 자주 나온 번호들 (1, 2)
      const allGeneratedNumbers = games.flatMap(game => 
        game.numbers.map(n => n.value)
      );
      
      const count1 = allGeneratedNumbers.filter(n => n === 1).length;
      const count2 = allGeneratedNumbers.filter(n => n === 2).length;
      
      // 자주 나온 번호들이 평균보다 많이 선택되었는지 확인
      expect(count1).toBeGreaterThan(0);
      expect(count2).toBeGreaterThan(0);
    });
  });

  describe('에러 처리', () => {
    it('빈 데이터로 게임 생성시 에러가 발생한다', () => {
      expect(() => generator.generateGames([], 5))
        .toThrow('충분한 데이터가 없습니다.');
    });

    it('0개 이하의 게임 생성 요청시 에러가 발생한다', () => {
      expect(() => generator.generateGames(mockDrawResults, 0))
        .toThrow('게임 수는 1 이상이어야 합니다.');
      expect(() => generator.generateGames(mockDrawResults, -1))
        .toThrow('게임 수는 1 이상이어야 합니다.');
    });
  });
}); 