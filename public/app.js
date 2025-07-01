class LottoApp {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentData = null;
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        this.elements = {
            generateBtn: document.getElementById('generate-btn'),
            regenerateBtn: document.getElementById('regenerate-btn'),
            gameCountSelect: document.getElementById('game-count'),
            analyzedRounds: document.getElementById('analyzed-rounds'),
            latestRound: document.getElementById('latest-round'),
            status: document.getElementById('status'),
            resultsSection: document.getElementById('results-section'),
            frequencySection: document.getElementById('frequency-section'),
            recentWinnersSection: document.getElementById('recent-winners-section'),
            generatedGames: document.getElementById('generated-games'),
            frequencyChart: document.getElementById('frequency-chart'),
            recentWinners: document.getElementById('recent-winners'),
            loading: document.getElementById('loading')
        };
    }

    attachEventListeners() {
        this.elements.generateBtn.addEventListener('click', () => this.generateNumbers());
        this.elements.regenerateBtn.addEventListener('click', () => this.generateNumbers());
    }

    async loadInitialData() {
        try {
            this.showLoading();
            this.updateStatus('데이터 로딩 중...');
            
            // 분석 데이터와 최근 당첨번호를 병렬로 로드
            const [analysisResponse, winnersResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/analysis`),
                fetch(`${this.apiBaseUrl}/recent-winners`)
            ]);
            
            if (!analysisResponse.ok) {
                throw new Error('분석 데이터 로딩 실패');
            }
            
            const analysisData = await analysisResponse.json();
            this.currentData = analysisData;
            
            this.updateAnalysisInfo(analysisData);
            this.updateFrequencyChart(analysisData.topNumbers);
            
            // 최근 당첨번호 로드 및 표시
            if (winnersResponse.ok) {
                const winnersData = await winnersResponse.json();
                this.updateRecentWinners(winnersData.winners);
                this.elements.recentWinnersSection.style.display = 'block';
            } else {
                console.warn('최근 당첨번호 로딩 실패');
            }
            
            this.updateStatus('데이터 로딩 완료');
            
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            this.updateStatus('데이터 로딩 실패');
            this.showErrorMessage('데이터 로딩에 실패했습니다. 다시 시도해주세요.');
        } finally {
            this.hideLoading();
        }
    }

    async generateNumbers() {
        try {
            this.showLoading();
            this.updateStatus('번호 생성 중...');
            this.elements.generateBtn.disabled = true;
            
            const gameCount = parseInt(this.elements.gameCountSelect.value);
            
            const response = await fetch(`${this.apiBaseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ gameCount })
            });
            
            if (!response.ok) {
                throw new Error('번호 생성 실패');
            }
            
            const data = await response.json();
            this.displayGeneratedGames(data.games);
            this.updateStatus('번호 생성 완료');
            
            // 결과 표시
            this.elements.resultsSection.style.display = 'block';
            this.elements.frequencySection.style.display = 'block';
            
            // 결과 섹션으로 스크롤
            this.elements.resultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
        } catch (error) {
            console.error('번호 생성 실패:', error);
            this.updateStatus('번호 생성 실패');
            this.showErrorMessage('번호 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            this.hideLoading();
            this.elements.generateBtn.disabled = false;
        }
    }

    updateAnalysisInfo(data) {
        this.elements.analyzedRounds.textContent = `${data.analyzedCount}회차`;
        this.elements.latestRound.textContent = `${data.latestRound}회차`;
    }

    updateStatus(status) {
        this.elements.status.textContent = status;
    }

    displayGeneratedGames(games) {
        const container = this.elements.generatedGames;
        container.innerHTML = '';
        
        games.forEach((game, index) => {
            const gameElement = this.createGameElement(game, index + 1);
            container.appendChild(gameElement);
        });
    }

    createGameElement(game, gameNumber) {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-item';
        
        const gameNumberDiv = document.createElement('div');
        gameNumberDiv.className = 'game-number';
        gameNumberDiv.textContent = `게임 ${gameNumber}`;
        
        const numbersRow = document.createElement('div');
        numbersRow.className = 'numbers-row';
        
        game.forEach(number => {
            const numberSpan = document.createElement('span');
            numberSpan.className = 'lotto-number';
            numberSpan.textContent = number;
            numbersRow.appendChild(numberSpan);
        });
        
        gameDiv.appendChild(gameNumberDiv);
        gameDiv.appendChild(numbersRow);
        
        return gameDiv;
    }

    updateFrequencyChart(topNumbers) {
        const container = this.elements.frequencyChart;
        container.innerHTML = '';
        
        const maxFrequency = Math.max(...topNumbers.map(item => item.frequency));
        
        topNumbers.slice(0, 20).forEach(item => {
            const itemElement = this.createFrequencyItem(item, maxFrequency);
            container.appendChild(itemElement);
        });
    }

    createFrequencyItem(item, maxFrequency) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'frequency-item';
        
        const numberDiv = document.createElement('div');
        numberDiv.className = 'frequency-number';
        numberDiv.textContent = item.number;
        
        const barContainer = document.createElement('div');
        barContainer.className = 'frequency-bar-container';
        
        const bar = document.createElement('div');
        bar.className = 'frequency-bar';
        const percentage = (item.frequency / maxFrequency) * 100;
        bar.style.width = `${percentage}%`;
        
        const countDiv = document.createElement('div');
        countDiv.className = 'frequency-count';
        countDiv.textContent = `${item.frequency}회`;
        
        barContainer.appendChild(bar);
        itemDiv.appendChild(numberDiv);
        itemDiv.appendChild(barContainer);
        itemDiv.appendChild(countDiv);
        
        return itemDiv;
    }

    updateRecentWinners(winners) {
        const container = this.elements.recentWinners;
        container.innerHTML = '';
        
        winners.forEach(winner => {
            const winnerElement = this.createWinnerElement(winner);
            container.appendChild(winnerElement);
        });
    }

    createWinnerElement(winner) {
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'winner-item';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'winner-header';
        headerDiv.innerHTML = `
            <span class="winner-round">${winner.round}회차</span>
            <span class="winner-date">${winner.date || ''}</span>
        `;
        
        const numbersDiv = document.createElement('div');
        numbersDiv.className = 'winner-numbers';
        
        // 일반 번호들
        const mainNumbers = document.createElement('div');
        mainNumbers.className = 'main-numbers';
        
        winner.numbers.forEach(number => {
            const numberSpan = document.createElement('span');
            numberSpan.className = 'winner-number';
            numberSpan.textContent = number;
            mainNumbers.appendChild(numberSpan);
        });
        
        numbersDiv.appendChild(mainNumbers);
        
        // 보너스 번호
        if (winner.bonusNumber) {
            const bonusDiv = document.createElement('div');
            bonusDiv.className = 'bonus-section';
            
            const plusSpan = document.createElement('span');
            plusSpan.className = 'plus-sign';
            plusSpan.textContent = '+';
            
            const bonusSpan = document.createElement('span');
            bonusSpan.className = 'bonus-number';
            bonusSpan.textContent = winner.bonusNumber;
            
            bonusDiv.appendChild(plusSpan);
            bonusDiv.appendChild(bonusSpan);
            numbersDiv.appendChild(bonusDiv);
        }
        
        winnerDiv.appendChild(headerDiv);
        winnerDiv.appendChild(numbersDiv);
        
        return winnerDiv;
    }

    showLoading() {
        this.elements.loading.style.display = 'flex';
    }

    hideLoading() {
        this.elements.loading.style.display = 'none';
    }

    showErrorMessage(message) {
        alert(message); // 오류 메시지 표시
    }
}

// DOM 초기화
document.addEventListener('DOMContentLoaded', () => {
    new LottoApp();
}); 