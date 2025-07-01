export class NumberStatisticsService {
  calculateFrequency(drawResults) {
    const frequency = new Map();
    
    for (const result of drawResults) {
      const allNumbers = result.getAllNumbers();
      
      for (const lottoNumber of allNumbers) {
        const value = lottoNumber.value;
        frequency.set(value, (frequency.get(value) || 0) + 1);
      }
    }
    
    return frequency;
  }

  getMostFrequentNumbers(drawResults, count) {
    const frequency = this.calculateFrequency(drawResults);
    
    const sortedNumbers = Array.from(frequency.entries())
      .map(([number, freq]) => ({ number, frequency: freq }))
      .sort((a, b) => {
        // 빈도수 내림차순, 빈도수가 같으면 번호 오름차순
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        return a.number - b.number;
      });
    
    return sortedNumbers.slice(0, count);
  }
} 