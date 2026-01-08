# Implementation Plan

- [x] 1. 프로젝트 설정 및 의존성 추가
  - pdf-parse 라이브러리 설치
  - openai 라이브러리 설치
  - multer 또는 formidable (파일 업로드)
  - _Requirements: 2.1, 3.2_

- [x] 2. 데이터베이스 스키마 및 유틸리티 구현
  - MongoDB 컬렉션 타입 정의
  - Portfolio, PortfolioQuestion 인터페이스 작성
  - _Requirements: 2.3, 4.4_

- [x] 3. PDF 파싱 유틸리티 구현
  - `lib/pdf-parser.ts` 생성
  - PDF에서 텍스트 추출 함수 작성
  - 오류 처리 추가
  - _Requirements: 2.2_

- [x] 4. AI 분석 유틸리티 구현
  - `lib/ai-analyzer.ts` 생성
  - OpenAI API 호출 함수 작성
  - 프롬프트 엔지니어링 (포트폴리오 → 면접 질문)
  - 응답 파싱 및 검증
  - _Requirements: 3.2, 3.3_

- [x] 5. 권한 체크 미들웨어 구현
  - `lib/auth-check.ts` 생성
  - 관리자 권한 확인 함수
  - 세션 검증
  - _Requirements: 1.2_

- [x] 6. 포트폴리오 업로드 API 구현
  - `app/api/portfolio/upload/route.ts` 생성
  - 파일 업로드 처리
  - PDF 텍스트 추출
  - MongoDB에 저장
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 7. 포트폴리오 분석 API 구현
  - `app/api/portfolio/analyze/route.ts` 생성
  - AI API 호출
  - 질문 생성 및 저장
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 8. 질문 CRUD API 구현
  - `app/api/portfolio/questions/route.ts` 생성
  - GET: 질문 목록 조회
  - POST: 질문 추가
  - PUT: 질문 수정
  - DELETE: 질문 삭제
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

- [x] 9. 포트폴리오 페이지 UI 구현
  - `app/portfolio/page.tsx` 생성
  - 권한 체크 (서버 컴포넌트)
  - 업로드 버튼
  - 질문 목록 표시
  - _Requirements: 1.1, 1.3, 4.1_

- [x] 10. 업로드 페이지 UI 구현
  - 파일 선택 UI
  - 업로드 진행 상태
  - 분석 버튼
  - _Requirements: 2.1, 3.1_

- [x] 11. 질문 관리 UI 구현
  - 질문 카드 컴포넌트
  - 수정/삭제 버튼
  - 질문 추가 폼
  - _Requirements: 4.2, 4.3, 4.4, 5.1_

- [x] 12. 네비게이션 업데이트
  - Header에 포트폴리오 링크 추가 (관리자만)
  - 카테고리 목록에서 제외
  - _Requirements: 1.1_

- [x] 13. 환경 변수 설정
  - OPENAI_API_KEY 추가
  - .env.local 업데이트
  - Vercel 환경 변수 설정 문서화
  - _Requirements: 3.2_

- [ ] 14. 최종 테스트 및 배포
  - 전체 워크플로우 테스트
  - 오류 처리 확인
  - GitHub 푸시 및 Vercel 배포
  - _Requirements: All_
