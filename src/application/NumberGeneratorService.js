import { LottoTicket } from '../domain/LottoTicket.js';

export class NumberGeneratorService {
  constructor(statisticsService) {
    this.statisticsService = statisticsService;
  }

  generateGames(drawResults, gameCount) {
    this.#validateInputs(drawResults, gameCount);
    
    const games = [];
    const weights = this.#calculateWeights(drawResults);
    
    for (let i = 0; i < gameCount; i++) {
      const numbers = this.#selectWeightedNumbers(weights, 6);
      games.push(new LottoTicket(numbers));
    }
    
    return games;
  }

  #validateInputs(drawResults, gameCount) {
    if (!drawResults || drawResults.length === 0) {
      throw new Error('데이터가 없습니다.');
    }
    
    if (gameCount < 1) {
      throw new Error('게임 수는 1 이상이어야 합니다.');
    }
  }

  #calculateWeights(drawResults) {
    const frequency = this.statisticsService.calculateFrequency(drawResults);
    const weights = new Map();
    
    // 빈도수에 따라 가중치 계산
    for (let i = 1; i <= 45; i++) {
      const freq = frequency.get(i) || 0;
      // 빈도수에 따라 가중치 계산
      weights.set(i, 1 + freq * 2);
    }
    
    return weights;
  }

  #selectWeightedNumbers(weights, count) {
    const selected = new Set();
    const weightArray = Array.from(weights.entries());
    
    while (selected.size < count) {
      const number = this.#weightedRandomSelect(weightArray);
      selected.add(number);
    }
    
    return Array.from(selected);
  }

  #weightedRandomSelect(weightArray) {
    const totalWeight = weightArray.reduce((sum, [, weight]) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [number, weight] of weightArray) {
      random -= weight;
      if (random <= 0) {
        return number;
      }
    }
    
    // fallback (이 부분에 도달해서는 안됨)
    return weightArray[weightArray.length - 1][0];
  }
} 