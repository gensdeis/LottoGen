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
            generatedGames: document.getElementById('generated-games'),
            frequencyChart: document.getElementById('frequency-chart'),
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
            
            const response = await fetch(`${this.apiBaseUrl}/analysis`);
            if (!response.ok) {
                throw new Error('데이터 로딩 실패');
            }
            
            const data = await response.json();
            this.currentData = data;
            
            this.updateAnalysisInfo(data);
            this.updateFrequencyChart(data.topNumbers);
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
            
            // 결과 섹션 표시
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
        this.elements.latestRound.textContent = `${data.latestRound}회`;
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

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', () => {
    new LottoApp();
}); 