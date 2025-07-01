import { LottoTicket } from './LottoTicket.js';
import { LottoNumber } from './LottoNumber.js';

export class DrawResult {
  constructor(drawNo, winningNumbers, bonusNumber, drawDate = null) {
    this.#validateDrawNo(drawNo);
    this.drawNo = drawNo;
    this.winningTicket = new LottoTicket(winningNumbers);
    this.bonusNumber = new LottoNumber(bonusNumber);
    this.drawDate = drawDate;
    this.#validateBonusNumber();
  }

  #validateDrawNo(drawNo) {
    if (typeof drawNo !== 'number' || drawNo < 1) {
      throw new Error('회차 번호는 1 이상이어야 합니다.');
    }
  }

  #validateBonusNumber() {
    if (this.winningTicket.contains(this.bonusNumber)) {
      throw new Error('보너스 번호는 당첨 번호와 중복될 수 없습니다.');
    }
  }

  getAllNumbers() {
    return [...this.winningTicket.numbers, this.bonusNumber];
  }

  contains(lottoNumber) {
    return this.winningTicket.contains(lottoNumber) || 
           this.bonusNumber.equals(lottoNumber);
  }
} 