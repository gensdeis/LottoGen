import { DrawResult } from '../domain/DrawResult.js';

export class MockLottoRepository {
  constructor() {
    // 최근 추첨 번호 데이터 생성
    this.mockData = this.generateMockData();
  }

  async getDrawResult(drawNo) {
    // 빠른 응답을 위한 대기
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const data = this.mockData.find(item => item.drawNo === drawNo);
    if (!data) {
      throw new Error(`${drawNo}회차 데이터가 없습니다`);
    }
    
    return new DrawResult(data.drawNo, data.winningNumbers, data.bonusNumber, data.drawDate);
  }

  async getRecentDrawResults(latestDrawNo, count) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const drawNo = latestDrawNo - i;
      try {
        const result = await this.getDrawResult(drawNo);
        results.push(result);
      } catch (error) {
        // 데이터 조회 실패 시 로그 출력
        console.warn(`${drawNo}회차 데이터 조회 실패`);
      }
    }
    
    return results;
  }

  generateMockData() {
    const mockData = [];
    
    // 최근 추첨 번호 데이터 생성
    const recentWinningNumbers = [
      { drawNo: 1178, winningNumbers: [2, 8, 15, 17, 28, 44], bonusNumber: 29, drawDate: "2024-12-14" },
      { drawNo: 1177, winningNumbers: [1, 14, 16, 21, 25, 31], bonusNumber: 32, drawDate: "2024-12-07" },
      { drawNo: 1176, winningNumbers: [3, 9, 18, 20, 33, 41], bonusNumber: 12, drawDate: "2024-11-30" },
      { drawNo: 1175, winningNumbers: [5, 11, 19, 24, 35, 43], bonusNumber: 7, drawDate: "2024-11-23" },
      { drawNo: 1174, winningNumbers: [4, 13, 22, 26, 37, 42], bonusNumber: 15, drawDate: "2024-11-16" },
      { drawNo: 1173, winningNumbers: [6, 10, 23, 27, 36, 40], bonusNumber: 18, drawDate: "2024-11-09" },
      { drawNo: 1172, winningNumbers: [7, 12, 17, 30, 38, 45], bonusNumber: 21, drawDate: "2024-11-02" },
      { drawNo: 1171, winningNumbers: [2, 9, 16, 29, 34, 39], bonusNumber: 25, drawDate: "2024-10-26" },
      { drawNo: 1170, winningNumbers: [1, 8, 14, 31, 35, 44], bonusNumber: 11, drawDate: "2024-10-19" },
      { drawNo: 1169, winningNumbers: [3, 10, 15, 28, 33, 41], bonusNumber: 19, drawDate: "2024-10-12" }
    ];

    // 최근 추첨 번호 데이터 추가
    mockData.push(...recentWinningNumbers);

    // 추첨 번호 데이터 생성 (1079~1168회차)
    for (let drawNo = 1168; drawNo >= 1079; drawNo--) {
      const winningNumbers = this.generateRandomNumbers(6, 1, 45);
      let bonusNumber;
      do {
        bonusNumber = Math.floor(Math.random() * 45) + 1;
      } while (winningNumbers.includes(bonusNumber));

      // 회차별 날짜 계산 (주 단위로 이전 날짜)
      const weeksDiff = 1187 - drawNo;
      const baseDate = new Date('2024-12-14');
      baseDate.setDate(baseDate.getDate() - (weeksDiff * 7));
      const drawDate = baseDate.toISOString().split('T')[0];

      mockData.push({
        drawNo,
        winningNumbers: winningNumbers.sort((a, b) => a - b),
        bonusNumber,
        drawDate
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