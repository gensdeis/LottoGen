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
        this.latestRound = 1178; // 최근 회차 번호
        this.analysisCount = 100; // 분석 회차 수
        
        this.initializeServices();
        this.setupMiddleware();
        this.setupRoutes();
        this.cacheData = null; // 분석 결과 캐시
    }

    initializeServices() {
        // 환경변수로 Mock 데이터 사용 여부 설정 (개발환경에서 유용)
        const useMockData = process.env.USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development';
        this.lottoRepository = new EnhancedLottoApiRepository(useMockData);
        this.statisticsService = new NumberStatisticsService();
        this.generatorService = new NumberGeneratorService(this.statisticsService);
        
        if (useMockData) {
            console.log('🧪 Mock 데이터 모드로 실행됩니다.');
        } else {
            console.log('🌐 실제 API 모드로 실행됩니다.');
        }
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    setupRoutes() {
        // 기본 페이지
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });

        // API 엔드포인트
        this.app.get('/api/analysis', this.handleAnalysis.bind(this));
        this.app.post('/api/generate', this.handleGenerate.bind(this));
        
        // 상태 확인
        this.app.get('/health', (req, res) => {
            res.json({ status: 'healthy', timestamp: new Date().toISOString() });
        });

        // 404 오류 처리
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Not Found' });
        });

        // 오류 처리
        this.app.use((error, req, res, next) => {
            console.error('서버 오류:', error);
            res.status(500).json({ 
                error: 'Internal Server Error',
                message: error.message 
            });
        });
    }

    async handleAnalysis(req, res) {
        try {
            // 캐시된 데이터 사용
            if (this.cacheData) {
                return res.json(this.cacheData);
            }

            console.log(`분석 데이터 조회 시작... (${this.analysisCount}회차)`);
            
            // 최근 100회차 데이터 조회
            const drawResults = await this.lottoRepository.getRecentDrawResults(
                this.latestRound, 
                this.analysisCount
            );

            if (drawResults.length === 0) {
                throw new Error('분석 데이터가 없습니다.');
            }

            console.log(`${drawResults.length}회차 데이터 조회 완료`);

            // 가장 자주 나온 번호 조회
            const topNumbers = this.statisticsService.getMostFrequentNumbers(drawResults, 45);
            
            const analysisData = {
                latestRound: this.latestRound,
                analyzedCount: drawResults.length,
                topNumbers: topNumbers,
                timestamp: new Date().toISOString()
            };

            // 캐시 데이터 저장
            this.cacheData = analysisData;
            setTimeout(() => {
                this.cacheData = null;
            }, 5 * 60 * 1000);

            res.json(analysisData);

        } catch (error) {
            console.error('분석 데이터 조회 실패:', error);
            res.status(500).json({
                error: '분석 데이터 조회 실패',
                message: error.message
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

            console.log(`${gameCount}개의 게임 생성 시작...`);

            // 캐시된 데이터 사용
            let drawResults;
            if (this.cacheData) {
                // 캐시된 데이터 사용
                drawResults = await this.lottoRepository.getRecentDrawResults(
                    this.latestRound, 
                    this.analysisCount
                );
            } else {
                drawResults = await this.lottoRepository.getRecentDrawResults(
                    this.latestRound, 
                    this.analysisCount
                );
            }

            // 게임 생성
            const games = this.generatorService.generateGames(drawResults, gameCount);
            
            const result = {
                games: games.map(ticket => ticket.numbers.map(n => n.value)),
                gameCount: games.length,
                generatedAt: new Date().toISOString()
            };

            console.log(`${result.gameCount}개의 게임 생성 완료`);
            res.json(result);

        } catch (error) {
            console.error('게임 생성 실패:', error);
            res.status(500).json({
                error: '게임 생성 실패',
                message: error.message
            });
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`? 번호 생성기 서버가 시작되었습니다!`);
            console.log(`? http://localhost:${this.port}`);
            console.log(`? 최근 회차: ${this.latestRound}회차 (${this.latestRound - this.analysisCount + 1}~${this.latestRound}회차)`);
        });
    }
}

// 서버 실행
const server = new LottoServer();
server.start(); 