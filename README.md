# GOAT123 - Greatest Of All Time 투표 배틀

실시간 투표 배틀 플랫폼 MVP - 무엇이든 최고를 가리는 근본 투표 서비스

## 🚀 주요 기능

### 메인 페이지
- **🔥 실시간 HOT 배틀**: 가장 치열한 접전 실시간 표시
- **🏆 최다 득표 TOP 3**: 1,2,3등 배틀 하이라이트
- **⚔️ 진행중인 배틀 리스트**: 카테고리별 필터링

### 투표 상세 페이지
- **투표 인터페이스**: 직관적인 A/B 선택
- **실시간 통계 대시보드**: 
  - 시간대별 투표 추이
  - 지역별/연령대별/성별 분포
  - 실시간 업데이트

## 🛠 기술 스택

- **Frontend**: React + TypeScript + Vite
- **UI Library**: Ant Design
- **Database**: Supabase
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Routing**: React Router v6

## 🎯 개선된 기능들

### 성능 최적화
- React.memo를 활용한 불필요한 리렌더링 방지
- useMemo, useCallback으로 연산 및 함수 최적화
- 이미지 lazy loading 및 최적화
- 컴포넌트 단위 코드 스플리팅

### 사용자 경험 개선
- 로딩 스켈레톤 UI
- 에러 바운더리 및 친화적인 에러 메시지
- 애니메이션 효과 (Framer Motion)
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 실시간 역전 알림 효과
- 공유 기능 (Web Share API)

### 데이터 관리
- Supabase Realtime으로 실시간 동기화
- 낙관적 업데이트 (Optimistic UI)
- 로컬스토리지 투표 기록 관리
- IP 기반 중복 투표 방지

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 모드 실행 (Mock 데이터)
```bash
npm run dev
```
현재 Mock 데이터로 실행되도록 설정되어 있습니다.

### 3. Supabase 연동 (프로덕션)
`.env` 파일을 생성하고 Supabase 정보를 입력:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

컴포넌트에서 import 경로 변경:
```typescript
// Mock 데이터 사용 시
import { useHotBattle } from '../hooks/useBattlesMock'

// Supabase 실제 데이터 사용 시
import { useHotBattle } from '../hooks/useBattles'
```

### 3. Supabase 설정
1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `supabase_schema.sql` 파일의 SQL을 Supabase SQL Editor에서 실행
3. 프로젝트 URL과 Anon Key를 `.env` 파일에 입력

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 빌드
```bash
npm run build
```

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── Layout.tsx          # 메인 레이아웃
│   ├── HotBattle.tsx       # HOT 배틀 컴포넌트
│   ├── TopRanking.tsx      # TOP 3 랭킹
│   ├── BattleList.tsx      # 배틀 리스트
│   ├── CategoryFilter.tsx  # 카테고리 필터
│   └── RealtimeDashboard.tsx # 실시간 통계
├── pages/
│   ├── HomePage.tsx        # 메인 페이지
│   └── BattleDetailPage.tsx # 투표 상세 페이지
├── lib/
│   ├── supabase.ts        # Supabase 클라이언트
│   └── mockData.ts        # 개발용 Mock 데이터
└── types/
    └── index.ts           # TypeScript 타입 정의
```

## 🎯 MVP 특징

- **무제한 투표**: 마감 시간 없이 계속 투표 가능
- **실시간 업데이트**: 1초마다 자동 갱신
- **반응형 디자인**: 모바일/데스크톱 최적화
- **익명 투표**: 로그인 없이 참여 가능
- **로컬 스토리지**: 투표 기록 저장

## 🔄 향후 개발 계획

- [ ] 사용자 인증 시스템
- [ ] 댓글 기능
- [ ] 포인트/리워드 시스템
- [ ] 사용자 투표 생성
- [ ] 소셜 로그인
- [ ] 푸시 알림

## 📝 라이선스

MIT License