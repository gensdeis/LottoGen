import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { EnhancedLottoApiRepository } from './infrastructure/EnhancedLottoApiRepository.js';
import { NumberStatisticsService } from './application/NumberStatisticsService.js';
import { NumberGeneratorService } from './application/NumberGeneratorService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LottoServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.latestRound = 1182; // 현재 최신 회차
        this.analysisCount = 100; // 분석할 회차 수
        
        this.initializeServices();
        this.setupMiddleware();
        this.setupRoutes();
        this.cacheData = null; // 분석 데이터 캐시
        this.cachedDrawResults = null; // 추첨 결과 데이터 캐시 (성능 최적화)
    }

    initializeServices() {
        // 환경변수 또는 네트워크 상태에 따라 Mock 데이터 사용
        const useMockData = process.env.USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development';
        this.lottoRepository = new EnhancedLottoApiRepository(useMockData);
        this.statisticsService = new NumberStatisticsService();
        this.generatorService = new NumberGeneratorService(this.statisticsService);
        
        if (useMockData) {
            console.log('? Mock 데이터 모드로 실행됩니다.');
        } else {
            console.log('? 실제 API 모드로 실행됩니다. (네트워크 오류 시 자동으로 Mock 데이터로 전환)');
        }
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    setupRoutes() {
        // 정적 파일 라우트
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });

        // API 라우트
        this.app.get('/api/analysis', this.handleAnalysis.bind(this));
        this.app.post('/api/generate', this.handleGenerate.bind(this));
        this.app.get('/api/recent-winners', this.handleRecentWinners.bind(this));
        this.app.get('/api/status', this.handleStatus.bind(this));
        this.app.post('/api/toggle-mock', this.handleToggleMock.bind(this));
        
        // 헬스체크
        this.app.get('/health', (req, res) => {
            const repoStatus = this.lottoRepository.getStatus();
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                repository: repoStatus
            });
        });

        // 404 처리
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Not Found' });
        });

        // 에러 처리
        this.app.use((error, req, res, next) => {
            console.error('서버 에러:', error);
            res.status(500).json({ 
                error: 'Internal Server Error',
                message: error.message 
            });
        });
    }

    async handleAnalysis(req, res) {
        try {
            // 캐시된 데이터가 있으면 반환
            if (this.cacheData) {
                const repoStatus = this.lottoRepository.getStatus();
                const response = {
                    ...this.cacheData,
                    cached: true,
                    dataSource: repoStatus.useMockData ? 'mock' : 'api'
                };
                return res.json(response);
            }

            console.log(`최근 ${this.analysisCount}회차 데이터 분석 시작...`);
            
            let drawResults;

            // 캐시된 데이터가 있으면 재사용
            if (this.cachedDrawResults && this.cachedDrawResults.length > 0) {
                console.log('캐시된 데이터 사용으로 빠른 분석');
                drawResults = this.cachedDrawResults;
            } else {
                console.log('새 데이터 조회 중...');
                // 최근 100회차 데이터 조회
                drawResults = await this.lottoRepository.getRecentDrawResults(
                    this.latestRound, 
                    this.analysisCount
                );

                if (drawResults.length === 0) {
                    throw new Error('분석할 데이터가 없습니다.');
                }

                // 캐시에 저장 (번호 생성에서도 재사용)
                this.cachedDrawResults = drawResults;
                setTimeout(() => {
                    this.cachedDrawResults = null;
                }, 5 * 60 * 1000);

                console.log(`${drawResults.length}회차 데이터 조회 완료`);
            }

            // 통계 분석
            const topNumbers = this.statisticsService.getMostFrequentNumbers(drawResults, 45);
            const repoStatus = this.lottoRepository.getStatus();
            
            const analysisData = {
                latestRound: this.latestRound,
                analyzedCount: drawResults.length,
                topNumbers: topNumbers,
                timestamp: new Date().toISOString(),
                dataSource: repoStatus.useMockData ? 'mock' : 'api',
                cached: false
            };

            // 캐시 저장 (5분간 유효)
            this.cacheData = analysisData;
            setTimeout(() => {
                this.cacheData = null;
            }, 5 * 60 * 1000);

            res.json(analysisData);

        } catch (error) {
            console.error('분석 처리 에러:', error);
            
            // API 실패 시 자동으로 Mock 데이터 시도
            if (!this.lottoRepository.getStatus().useMockData) {
                console.log('API 실패로 인해 Mock 데이터로 재시도합니다...');
                try {
                    this.lottoRepository.enableMockData();
                    return await this.handleAnalysis(req, res);
                } catch (mockError) {
                    console.error('Mock 데이터로도 실패:', mockError);
                }
            }
            
            res.status(500).json({
                error: '데이터 분석에 실패했습니다.',
                message: error.message,
                suggestion: 'Mock 데이터 모드를 사용해보세요.'
            });
        }
    }

    async handleGenerate(req, res) {
        try {
            const { gameCount = 5 } = req.body;

            if (gameCount < 1 || gameCount > 20) {
                return res.status(400).json({
                    error: '게임 수는 1~20 사이여야 합니다.'
                });
            }

            console.log(`${gameCount}게임 번호 생성 시작...`);

            let drawResults;

            // 캐시된 데이터가 있으면 재사용하여 성능 최적화
            if (this.cachedDrawResults && this.cachedDrawResults.length > 0) {
                console.log('캐시된 데이터 사용으로 빠른 생성');
                drawResults = this.cachedDrawResults;
            } else {
                console.log('새 데이터 조회 중...');
                // 캐시된 데이터가 없으면 새로 조회
                drawResults = await this.lottoRepository.getRecentDrawResults(
                    this.latestRound, 
                    this.analysisCount
                );
                
                if (drawResults.length === 0) {
                    throw new Error('번호 생성을 위한 데이터가 없습니다.');
                }

                // 다음 번을 위해 캐시 저장 (5분간 유효)
                this.cachedDrawResults = drawResults;
                setTimeout(() => {
                    this.cachedDrawResults = null;
                }, 5 * 60 * 1000);
            }

            // 번호 생성
            const games = this.generatorService.generateGames(drawResults, gameCount);
            const repoStatus = this.lottoRepository.getStatus();
            
            const result = {
                games: games.map(ticket => ticket.numbers.map(n => n.value)),
                gameCount: games.length,
                generatedAt: new Date().toISOString(),
                dataSource: repoStatus.useMockData ? 'mock' : 'api',
                basedOnRounds: drawResults.length
            };

            console.log(`${result.gameCount}게임 번호 생성 완료`);
            res.json(result);

        } catch (error) {
            console.error('번호 생성 에러:', error);
            
            // API 실패 시 자동으로 Mock 데이터 시도
            if (!this.lottoRepository.getStatus().useMockData) {
                console.log('API 실패로 인해 Mock 데이터로 재시도합니다...');
                try {
                    this.lottoRepository.enableMockData();
                    return await this.handleGenerate(req, res);
                } catch (mockError) {
                    console.error('Mock 데이터로도 실패:', mockError);
                }
            }
            
            res.status(500).json({
                error: '번호 생성에 실패했습니다.',
                message: error.message
            });
        }
    }

    async handleRecentWinners(req, res) {
        try {
            console.log('최근 5회차 당첨번호 조회 시작...');
            
            // 최근 5회차 데이터 조회
            const drawResults = await this.lottoRepository.getRecentDrawResults(
                this.latestRound, 
                5
            );

            if (drawResults.length === 0) {
                throw new Error('최근 당첨번호 데이터가 없습니다.');
            }

            const recentWinners = drawResults.map(result => ({
                round: result.drawNo,
                date: result.drawDate,
                numbers: result.winningTicket.numbers.map(n => n.value),
                bonusNumber: result.bonusNumber ? result.bonusNumber.value : null
            }));

            const repoStatus = this.lottoRepository.getStatus();
            
            res.json({
                winners: recentWinners,
                count: recentWinners.length,
                dataSource: repoStatus.useMockData ? 'mock' : 'api',
                timestamp: new Date().toISOString()
            });

            console.log(`${recentWinners.length}회차 당첨번호 조회 완료`);

        } catch (error) {
            console.error('최근 당첨번호 조회 에러:', error);
            
            // API 실패 시 자동으로 Mock 데이터 시도
            if (!this.lottoRepository.getStatus().useMockData) {
                console.log('API 실패로 인해 Mock 데이터로 재시도합니다...');
                try {
                    this.lottoRepository.enableMockData();
                    return await this.handleRecentWinners(req, res);
                } catch (mockError) {
                    console.error('Mock 데이터로도 실패:', mockError);
                }
            }
            
            res.status(500).json({
                error: '최근 당첨번호 조회에 실패했습니다.',
                message: error.message
            });
        }
    }

    async handleStatus(req, res) {
        try {
            const repoStatus = this.lottoRepository.getStatus();
            res.json({
                server: {
                    uptime: process.uptime(),
                    latestRound: this.latestRound,
                    analysisCount: this.analysisCount,
                    cacheStatus: this.cacheData ? 'cached' : 'empty'
                },
                repository: repoStatus,
                environment: {
                    nodeEnv: process.env.NODE_ENV,
                    useMockDataEnv: process.env.USE_MOCK_DATA
                }
            });
        } catch (error) {
            res.status(500).json({
                error: '상태 조회에 실패했습니다.',
                message: error.message
            });
        }
    }
    async handleToggleMock(req, res) {
        try {
            const { enable } = req.body;
            
            if (enable === true) {
                this.lottoRepository.enableMockData();
                this.cacheData = null; // 분석 캐시 클리어
                this.cachedDrawResults = null; // 추첨 결과 캐시 클리어
                res.json({ 
                    message: 'Mock 데이터 모드로 전환되었습니다.',
                    status: this.lottoRepository.getStatus()
                });
            } else if (enable === false) {
                this.lottoRepository.enableRealApi();
                this.cacheData = null; // 분석 캐시 클리어
                this.cachedDrawResults = null; // 추첨 결과 캐시 클리어
                res.json({ 
                    message: '실제 API 모드로 전환되었습니다.',
                    status: this.lottoRepository.getStatus()
                });
            } else {
                res.status(400).json({
                    error: 'enable 필드에 true 또는 false 값이 필요합니다.'
                });
            }
        } catch (error) {
            res.status(500).json({
                error: '모드 전환에 실패했습니다.',
                message: error.message
            });
        }
    }

    start() {
        const host = process.env.HOST || '0.0.0.0';
        this.app.listen(this.port, host, () => {
            console.log(`로또 번호 생성기 서버가 시작되었습니다!`);
            console.log(`http://${host}:${this.port}`);
            console.log(`분석 대상: 최근 ${this.analysisCount}회차 (${this.latestRound - this.analysisCount + 1}~${this.latestRound}회)`);
            console.log(`Mock 데이터 모드 전환: POST /api/toggle-mock {"enable": true/false}`);
        });
    }
}

// 서버 시작
const server = new LottoServer();
server.start(); 