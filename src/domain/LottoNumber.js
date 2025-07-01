export class LottoNumber {
  constructor(value) {
    this.#validate(value);
    this.value = value;
  }

  #validate(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('번호는 숫자여야 합니다.');
    }

    if (value < 1 || value > 45) {
      throw new Error('번호는 1부터 45 사이여야 합니다.');
    }
  }

  equals(other) {
    if (!(other instanceof LottoNumber)) {
      return false;
    }
    return this.value === other.value;
  }

  toString() {
    return this.value.toString();
  }
} 