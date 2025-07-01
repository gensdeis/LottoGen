import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LottoApiRepository } from '../../src/infrastructure/LottoApiRepository.js';
import { DrawResult } from '../../src/domain/DrawResult.js';

// axios mock
const mockAxios = {
  get: jest.fn()
};

jest.unstable_mockModule('axios', () => ({
  default: mockAxios
}));

describe('LottoApiRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new LottoApiRepository();
    jest.clearAllMocks();
  });

  describe('회차별 데이터 조회', () => {
    it('성공적으로 회차 데이터를 조회할 수 있다', async () => {
      const mockResponse = {
        data: {
          returnValue: 'success',
          drwNo: 1178,
          drwtNo1: 1,
          drwtNo2: 2,
          drwtNo3: 3,
          drwtNo4: 4,
          drwtNo5: 5,
          drwtNo6: 6,
          bnusNo: 7
        }
      };
      
      mockAxios.get.mockResolvedValue(mockResponse);
      
      const result = await repository.getDrawResult(1178);
      
      expect(result).toBeInstanceOf(DrawResult);
      expect(result.drawNo).toBe(1178);
      expect(result.winningTicket.numbers.map(n => n.value)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.bonusNumber.value).toBe(7);
    });

    it('API 호출 실패시 에러를 던진다', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network error'));
      
      await expect(repository.getDrawResult(1178))
        .rejects.toThrow('1178회차 데이터 조회에 실패했습니다: Network error');
    });

    it('성공하지 않은 응답시 에러를 던진다', async () => {
      const mockResponse = {
        data: {
          returnValue: 'fail'
        }
      };
      
      mockAxios.get.mockResolvedValue(mockResponse);
      
      await expect(repository.getDrawResult(1178))
        .rejects.toThrow('1178회차 데이터를 찾을 수 없습니다');
    });

    it('올바른 URL로 API를 호출한다', async () => {
      const mockResponse = {
        data: {
          returnValue: 'success',
          drwNo: 1178,
          drwtNo1: 1, drwtNo2: 2, drwtNo3: 3,
          drwtNo4: 4, drwtNo5: 5, drwtNo6: 6,
          bnusNo: 7
        }
      };
      
      mockAxios.get.mockResolvedValue(mockResponse);
      
      await repository.getDrawResult(1178);
      
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1178'
      );
    });
  });

  describe('최근 회차 데이터 조회', () => {
    it('최근 N회차 데이터를 조회할 수 있다', async () => {
      const mockResponse = {
        data: {
          returnValue: 'success',
          drwNo: 1178,
          drwtNo1: 1, drwtNo2: 2, drwtNo3: 3,
          drwtNo4: 4, drwtNo5: 5, drwtNo6: 6,
          bnusNo: 7
        }
      };
      
      mockAxios.get.mockResolvedValue(mockResponse);
      
      const results = await repository.getRecentDrawResults(1178, 3);
      
      expect(results).toHaveLength(3);
      expect(mockAxios.get).toHaveBeenCalledTimes(3);
      expect(mockAxios.get).toHaveBeenNthCalledWith(1,
        'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1178'
      );
      expect(mockAxios.get).toHaveBeenNthCalledWith(2,
        'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1177'
      );
      expect(mockAxios.get).toHaveBeenNthCalledWith(3,
        'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1176'
      );
    });

    it('일부 회차 조회 실패시 성공한 것만 반환한다', async () => {
      mockAxios.get
        .mockResolvedValueOnce({
          data: {
            returnValue: 'success',
            drwNo: 1178,
            drwtNo1: 1, drwtNo2: 2, drwtNo3: 3,
            drwtNo4: 4, drwtNo5: 5, drwtNo6: 6,
            bnusNo: 7
          }
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            returnValue: 'success',
            drwNo: 1176,
            drwtNo1: 8, drwtNo2: 9, drwtNo3: 10,
            drwtNo4: 11, drwtNo5: 12, drwtNo6: 13,
            bnusNo: 14
          }
        });
      
      const results = await repository.getRecentDrawResults(1178, 3);
      
      expect(results).toHaveLength(2);
      expect(results[0].drawNo).toBe(1178);
      expect(results[1].drawNo).toBe(1176);
    });
  });
}); 