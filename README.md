# 스마트 로또 번호 생성기

최근 100회차 로또 당첨 번호를 분석하여 과학적으로 번호를 추천하는 웹 애플리케이션입니다.

## 주요 기능

- **통계 기반 분석**: 최근 100회차 당첨 번호 데이터 분석
- **가중 확률 생성**: 자주 나온 번호에 높은 가중치를 부여한 번호 생성
- **다중 게임 생성**: 3게임, 5게임, 10게임 선택 가능
- **시각적 통계**: 번호별 출현 빈도를 차트로 표시
- **반응형 웹**: 모바일과 데스크톱 모두 지원
- **실시간 데이터**: 공식 로또 API에서 실시간 데이터 조회

## 기술 스택

### 아키텍처
- **Clean Architecture**: 도메인 중심 설계
- **SOLID 원칙**: 객체지향 설계 원칙 적용
- **TDD**: 테스트 주도 개발

### 백엔드
- **Node.js**: JavaScript 런타임
- **Express**: 웹 프레임워크
- **Axios**: HTTP 클라이언트

### 프론트엔드
- **Vanilla JavaScript**: 순수 자바스크립트
- **CSS3**: 모던 CSS 및 반응형 디자인
- **HTML5**: 시맨틱 마크업

### 테스트
- **Jest**: 테스트 프레임워크
- **단위 테스트**: 모든 주요 컴포넌트 테스트 커버리지

## 설치 방법

### 1. 저장소 클론
\`\`\`bash
git clone <repository-url>
cd LottoGen
\`\`\`

### 2. 의존성 설치
\`\`\`bash
npm install
\`\`\`

### 3. 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`

### 4. 프로덕션 서버 실행
\`\`\`bash
npm start
\`\`\`

서버가 시작되면 http://localhost:3000 에서 웹 애플리케이션에 접근할 수 있습니다.

## 테스트 실행

### 전체 테스트 실행
\`\`\`bash
npm test
\`\`\`

### 테스트 감시 모드
\`\`\`bash
npm run test:watch
\`\`\`

## 사용법

1. **웹브라우저에서 애플리케이션 접근**
   - http://localhost:3000 방문

2. **데이터 분석 확인**
   - 페이지 로드시 자동으로 최근 100회차 데이터 분석
   - 분석 정보 섹션에서 현재 상태 확인

3. **번호 생성**
   - 원하는 게임 수 선택 (3, 5, 10게임)
   - "번호 생성하기" 버튼 클릭
   - 생성된 번호와 통계 정보 확인

4. **번호 재생성**
   - "다시 생성하기" 버튼으로 새로운 번호 생성

## 프로젝트 구조

\`\`\`
LottoGen/
├── src/
│   ├── domain/              # 도메인 엔티티
│   │   ├── LottoNumber.js
│   │   ├── LottoTicket.js
│   │   └── DrawResult.js
│   ├── application/         # 유스케이스 & 서비스
│   │   ├── NumberStatisticsService.js
│   │   └── NumberGeneratorService.js
│   ├── infrastructure/      # 외부 연동
│   │   └── LottoApiRepository.js
│   └── index.js            # 서버 진입점
├── tests/                  # 테스트 코드
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── public/                 # 정적 파일
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── package.json
└── README.md
\`\`\`

## API 엔드포인트

### GET /api/analysis
최근 100회차 데이터 분석 결과 반환
\`\`\`json
{
  "latestRound": 1178,
  "analyzedCount": 100,
  "topNumbers": [
    { "number": 1, "frequency": 15 },
    ...
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

### POST /api/generate
로또 번호 생성
\`\`\`json
// Request
{
  "gameCount": 5
}

// Response
{
  "games": [
    [1, 7, 15, 23, 31, 42],
    ...
  ],
  "gameCount": 5,
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
\`\`\`

## 알고리즘 설명

### 통계 분석
1. 최근 100회차 당첨 번호 수집
2. 각 번호(1-45)의 출현 빈도 계산
3. 보너스 번호도 포함하여 분석

### 번호 생성
1. **가중치 계산**: 기본 가중치(1) + 출현 빈도 × 2
2. **가중 랜덤 선택**: 높은 가중치일수록 선택 확률 증가
3. **중복 제거**: 6개의 서로 다른 번호 보장
4. **자동 정렬**: 생성된 번호를 오름차순 정렬

## 주의사항

- 본 서비스는 과거 데이터 분석을 기반으로 하며, **당첨을 보장하지 않습니다**
- 로또는 확률 게임이므로 **적정한 금액으로 건전하게** 즐기세요
- 실제 로또 API 호출로 인해 **네트워크 연결**이 필요합니다

## 업데이트 계획

- [ ] 더 정교한 통계 분석 알고리즘
- [ ] 사용자 맞춤 번호 패턴 설정
- [ ] 당첨 번호 예측 정확도 추적
- [ ] 모바일 앱 버전 개발

## 라이선스

MIT License

## 기여하기

1. 포크 생성
2. 기능 브랜치 생성 (\`git checkout -b feature/amazing-feature\`)
3. 변경사항 커밋 (\`git commit -m 'Add amazing feature'\`)
4. 브랜치에 푸시 (\`git push origin feature/amazing-feature\`)
5. Pull Request 생성

## 지원

문제가 발생하거나 질문이 있으시면 Issue를 생성해 주세요.

---

**행운을 빕니다! ** 