import { DrawResult } from '../domain/DrawResult.js';

export class MockLottoRepository {
  constructor() {
    // 실제 로또 당첨 번호를 기반으로 한 테스트 데이터
    this.mockData = this.generateMockData();
  }

  async getDrawResult(drawNo) {
    // 약간의 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const data = this.mockData.find(item => item.drawNo === drawNo);
    if (!data) {
      throw new Error(`${drawNo}회차 데이터를 찾을 수 없습니다`);
    }
    
    return new DrawResult(data.drawNo, data.winningNumbers, data.bonusNumber);
  }

  async getRecentDrawResults(latestDrawNo, count) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const drawNo = latestDrawNo - i;
      try {
        const result = await this.getDrawResult(drawNo);
        results.push(result);
      } catch (error) {
        // 데이터가 없는 회차는 건너뛰기
        console.warn(`${drawNo}회차 데이터 없음`);
      }
    }
    
    return results;
  }

  generateMockData() {
    const mockData = [];
    
    // 실제 로또 당첨 번호 패턴을 기반으로 한 테스트 데이터
    const recentWinningNumbers = [
      { drawNo: 1178, winningNumbers: [2, 8, 15, 17, 28, 44], bonusNumber: 29 },
      { drawNo: 1177, winningNumbers: [1, 14, 16, 21, 25, 31], bonusNumber: 32 },
      { drawNo: 1176, winningNumbers: [3, 9, 18, 20, 33, 41], bonusNumber: 12 },
      { drawNo: 1175, winningNumbers: [5, 11, 19, 24, 35, 43], bonusNumber: 7 },
      { drawNo: 1174, winningNumbers: [4, 13, 22, 26, 37, 42], bonusNumber: 15 },
      { drawNo: 1173, winningNumbers: [6, 10, 23, 27, 36, 40], bonusNumber: 18 },
      { drawNo: 1172, winningNumbers: [7, 12, 17, 30, 38, 45], bonusNumber: 21 },
      { drawNo: 1171, winningNumbers: [2, 9, 16, 29, 34, 39], bonusNumber: 25 },
      { drawNo: 1170, winningNumbers: [1, 8, 14, 31, 35, 44], bonusNumber: 11 },
      { drawNo: 1169, winningNumbers: [3, 10, 15, 28, 33, 41], bonusNumber: 19 }
    ];

    // 기본 데이터 추가
    mockData.push(...recentWinningNumbers);

    // 추가 데이터 생성 (1079~1168회차)
    for (let drawNo = 1168; drawNo >= 1079; drawNo--) {
      const winningNumbers = this.generateRandomNumbers(6, 1, 45);
      let bonusNumber;
      do {
        bonusNumber = Math.floor(Math.random() * 45) + 1;
      } while (winningNumbers.includes(bonusNumber));

      mockData.push({
        drawNo,
        winningNumbers: winningNumbers.sort((a, b) => a - b),
        bonusNumber
      });
    }

    return mockData;
  }

  generateRandomNumbers(count, min, max) {
    const numbers = new Set();
    while (numbers.size < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      numbers.add(num);
    }
    return Array.from(numbers);
  }
} 