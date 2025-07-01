import axios from 'axios';
import { DrawResult } from '../domain/DrawResult.js';

export class LottoApiRepository {
  constructor() {
    this.baseUrl = 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber';
    this.timeout = 10000; // 10초 타임아웃
    this.retryCount = 3; // 재시도 횟수
  }

  async getDrawResult(drawNo) {
    try {
      const url = `${this.baseUrl}&drwNo=${drawNo}`;
      const response = await axios.get(url);
      
      if (response.data.returnValue !== 'success') {
        throw new Error(`${drawNo}회차 데이터를 찾을 수 없습니다`);
      }
      
      return this.#convertToDrawResult(response.data);
    } catch (error) {
      if (error.message.includes('회차 데이터를 찾을 수 없습니다')) {
        throw error;
      }
      throw new Error(`${drawNo}회차 데이터 조회 실패: ${error.message}`);
    }
  }

  async getRecentDrawResults(latestDrawNo, count) {
    const promises = [];
    
    for (let i = 0; i < count; i++) {
      const drawNo = latestDrawNo - i;
      promises.push(this.#getDrawResultSafely(drawNo));
    }
    
    const results = await Promise.all(promises);
    return results.filter(result => result !== null);
  }

  async #getDrawResultSafely(drawNo) {
    try {
      return await this.getDrawResult(drawNo);
    } catch (error) {
      console.warn(`${drawNo}회차 데이터 조회 실패:`, error.message);
      return null;
    }
  }

  #convertToDrawResult(apiData) {
    const winningNumbers = [
      apiData.drwtNo1,
      apiData.drwtNo2,
      apiData.drwtNo3,
      apiData.drwtNo4,
      apiData.drwtNo5,
      apiData.drwtNo6
    ];
    
    return new DrawResult(
      apiData.drwNo,
      winningNumbers,
      apiData.bnusNo
    );
  }
} 