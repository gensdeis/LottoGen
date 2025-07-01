import axios from 'axios';
import { DrawResult } from '../domain/DrawResult.js';
import { MockLottoRepository } from './MockLottoRepository.js';

export class EnhancedLottoApiRepository {
  constructor(useMockData = false) {
    this.baseUrl = 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber';
    this.timeout = 10000; // 10초 타임아웃
    this.retryCount = 3; // 재시도 횟수
    this.useMockData = useMockData;
    this.mockRepository = new MockLottoRepository();
    this.apiFailureCount = 0;
    this.maxApiFailures = 5; // 연속 실패 5회 시 Mock 데이터로 전환
  }

  async getDrawResult(drawNo) {
    // Mock 데이터 사용 설정이거나, API 연속 실패 시 Mock 사용
    if (this.useMockData || this.apiFailureCount >= this.maxApiFailures) {
      console.log(`Mock 데이터 사용: ${drawNo}회차`);
      return await this.mockRepository.getDrawResult(drawNo);
    }

    // 실제 API 호출 시도
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const url = `${this.baseUrl}&drwNo=${drawNo}`;
        const response = await axios.get(url, {
          timeout: this.timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
          }
        });
        
        if (response.data.returnValue !== 'success') {
          throw new Error(`${drawNo}회차 데이터를 찾을 수 없습니다`);
        }
        
        // API 성공 시 실패 카운트 리셋
        this.apiFailureCount = 0;
        return this.#convertToDrawResult(response.data);
        
      } catch (error) {
        if (error.message.includes('회차 데이터를 찾을 수 없습니다')) {
          throw error;
        }
        
        console.warn(`${drawNo}회차 API 호출 실패 (시도 ${attempt}/${this.retryCount}):`, error.message);
        
        if (attempt === this.retryCount) {
          this.apiFailureCount++;
          
          // 연속 실패가 임계값에 도달하면 Mock 데이터로 대체
          if (this.apiFailureCount >= this.maxApiFailures) {
            console.warn(`API 연속 실패 ${this.apiFailureCount}회, Mock 데이터로 전환합니다.`);
            return await this.mockRepository.getDrawResult(drawNo);
          }
          
          throw new Error(`${drawNo}회차 데이터 조회에 실패했습니다: ${error.message}`);
        }
        
        // 재시도 전 대기 (지수적 백오프)
        const delay = Math.pow(2, attempt - 1) * 1000; // 1초, 2초, 4초...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async getRecentDrawResults(latestDrawNo, count) {
    // Mock 데이터 사용 시 Mock Repository 직접 호출
    if (this.useMockData || this.apiFailureCount >= this.maxApiFailures) {
      console.log(`Mock 데이터로 최근 ${count}회차 조회`);
      return await this.mockRepository.getRecentDrawResults(latestDrawNo, count);
    }

    const results = [];
    let consecutiveFailures = 0;
    
    for (let i = 0; i < count; i++) {
      const drawNo = latestDrawNo - i;
      try {
        const result = await this.getDrawResult(drawNo);
        results.push(result);
        consecutiveFailures = 0; // 성공 시 연속 실패 카운트 리셋
      } catch (error) {
        consecutiveFailures++;
        console.warn(`${drawNo}회차 데이터 조회 실패:`, error.message);
        
        // 연속 실패가 많으면 Mock 데이터로 전환
        if (consecutiveFailures >= 3) {
          console.warn('연속 실패가 많아 Mock 데이터로 전환합니다.');
          this.useMockData = true;
          const mockResults = await this.mockRepository.getRecentDrawResults(latestDrawNo, count);
          return [...results, ...mockResults.slice(results.length)];
        }
      }
    }
    
    return results;
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

  // Mock 데이터 사용 강제 설정
  enableMockData() {
    this.useMockData = true;
    console.log('Mock 데이터 모드로 전환되었습니다.');
  }

  // 실제 API 사용 재시도
  enableRealApi() {
    this.useMockData = false;
    this.apiFailureCount = 0;
    console.log('실제 API 모드로 전환되었습니다.');
  }

  // 현재 상태 확인
  getStatus() {
    return {
      useMockData: this.useMockData,
      apiFailureCount: this.apiFailureCount,
      maxApiFailures: this.maxApiFailures
    };
  }
} 