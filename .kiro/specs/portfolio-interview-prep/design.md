# Design Document

## Overview

포트폴리오 기반 면접 준비 시스템은 관리자가 포트폴리오를 업로드하고 AI 분석을 통해 맞춤형 면접 질문을 생성하는 기능입니다.

## Architecture

### 시스템 구성
- **Frontend**: Next.js 페이지 (관리자 전용)
- **Backend**: Next.js API Routes
- **Database**: MongoDB (portfolios, portfolio_questions 컬렉션)
- **File Storage**: 서버 파일 시스템 또는 S3
- **AI Service**: OpenAI API (GPT-4)

### 데이터 흐름
1. 관리자가 PDF 업로드
2. 서버에서 PDF 텍스트 추출
3. MongoDB에 포트폴리오 저장
4. AI API로 분석 요청
5. 생성된 질문을 MongoDB에 저장
6. 프론트엔드에 표시

## Components and Interfaces

### 1. 페이지 컴포넌트

#### `/app/portfolio/page.tsx`
관리자 전용 포트폴리오 페이지
- 권한 체크 (서버 컴포넌트)
- 포트폴리오 업로드 UI
- 질문 목록 표시

#### `/app/portfolio/upload/page.tsx`
포트폴리오 업로드 페이지
- 파일 선택 UI
- 업로드 진행 상태
- 분석 버튼

### 2. API Routes

#### `/app/api/portfolio/upload/route.ts`
```typescript
POST /api/portfolio/upload
- 파일 업로드 처리
- PDF 텍스트 추출
- MongoDB 저장
- Response: { portfolioId, success }
```

#### `/app/api/portfolio/analyze/route.ts`
```typescript
POST /api/portfolio/analyze
- 포트폴리오 ID 받기
- AI API 호출
- 질문 생성 및 저장
- Response: { questions[], success }
```

#### `/app/api/portfolio/questions/route.ts`
```typescript
GET /api/portfolio/questions
- 관리자 질문 목록 조회

POST /api/portfolio/questions
- 수동 질문 추가

PUT /api/portfolio/questions/[id]
- 질문 수정

DELETE /api/portfolio/questions/[id]
- 질문 삭제
```

### 3. 유틸리티 함수

#### `lib/pdf-parser.ts`
```typescript
export async function extractTextFromPDF(file: File): Promise<string>
```

#### `lib/ai-analyzer.ts`
```typescript
export async function analyzePortfolio(content: string): Promise<Question[]>
```

## Data Models

### Portfolio Collection
```typescript
{
  _id: ObjectId,
  userId: string,
  fileName: string,
  content: string,  // 추출된 텍스트
  uploadedAt: Date,
  analyzedAt?: Date
}
```

### PortfolioQuestion Collection
```typescript
{
  _id: ObjectId,
  userId: string,
  portfolioId: ObjectId,
  question: string,
  suggestedAnswer: string,
  category: string,  // 'portfolio'
  isAIGenerated: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

### 파일 업로드 오류
- 파일 크기 초과: 10MB 제한
- 잘못된 파일 형식: PDF만 허용
- PDF 파싱 실패: 사용자에게 알림

### AI 분석 오류
- API 호출 실패: 재시도 로직
- 타임아웃: 30초 제한
- 응답 파싱 실패: 기본 질문 제공

### 권한 오류
- 비로그인 사용자: 로그인 페이지로 리다이렉트
- 일반 사용자: 홈으로 리다이렉트 + 오류 메시지

## Testing Strategy

### Unit Tests
- PDF 텍스트 추출 함수
- AI 응답 파싱 함수
- 권한 체크 함수

### Integration Tests
- 파일 업로드 플로우
- AI 분석 플로우
- 질문 CRUD 작업

### E2E Tests
- 전체 워크플로우 (업로드 → 분석 → 질문 확인)
