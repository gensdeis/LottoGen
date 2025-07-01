import { LottoNumber } from './LottoNumber.js';

export class LottoTicket {
  constructor(numbers) {
    this.numbers = this.#processNumbers(numbers);
    this.#validate();
    this.#sort();
  }

  #processNumbers(numbers) {
    return numbers.map(num => {
      if (num instanceof LottoNumber) {
        return num;
      }
      return new LottoNumber(num);
    });
  }

  #validate() {
    if (this.numbers.length !== 6) {
      throw new Error('로또 번호는 6개여야 합니다.');
    }

    const values = this.numbers.map(n => n.value);
    const uniqueValues = new Set(values);
    
    if (uniqueValues.size !== values.length) {
      throw new Error('번호는 중복될 수 없습니다.');
    }
  }

  #sort() {
    this.numbers.sort((a, b) => a.value - b.value);
  }

  contains(lottoNumber) {
    return this.numbers.some(num => num.equals(lottoNumber));
  }

  toString() {
    return this.numbers.map(num => num.value).join(', ');
  }
} 