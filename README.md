
<img width="1507" height="843" alt="image" src="https://github.com/user-attachments/assets/7eb43472-ff21-46ae-b3a0-80e46b29e597" />

# 클라우드/인프라 면접 질문 웹사이트

클라우드 및 인프라 엔지니어를 위한 면접 질문과 답변을 카테고리별로 정리한 웹사이트입니다.

## 주요 기능

- 📚 카테고리별 질문 분류 (네트워크, Linux, 클라우드, 컨테이너, CI/CD)
- 💡 간단한 면접 답변 + 상세 설명
- ✏️ Markdown 파일로 쉽게 수정 가능
- 👤 회원가입/로그인 기능
- ❤️ 질문 찜하기 기능
- 📱 마이페이지에서 찜한 질문 관리
- 👑 관리자/일반 회원 권한 구분
- 🚀 Vercel로 간편한 배포

## 시작하기

### 1. MongoDB 설치 및 실행

#### 로컬 MongoDB 사용
```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# 또는 Docker 사용
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas 사용 (클라우드)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 가입
2. 무료 클러스터 생성
3. 연결 문자열 복사

### 2. 환경 변수 설정

`.env.local` 파일을 수정하세요:

```env
# MongoDB 연결 (로컬 또는 Atlas)
MONGODB_URI=mongodb://localhost:27017/interview-questions
# 또는
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interview-questions

# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=랜덤한-비밀키-여기에-입력

# 관리자 이메일 (이 이메일로 가입하면 자동으로 관리자)
ADMIN_EMAIL=admin@example.com
```

### 3. 의존성 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 4. 관리자 계정 생성

1. 회원가입 페이지에서 `.env.local`의 `ADMIN_EMAIL`과 동일한 이메일로 가입
2. 자동으로 관리자 권한이 부여됩니다

## 사용 방법

### 회원 기능
- **회원가입**: 이름, 이메일, 비밀번호로 가입
- **로그인**: 이메일과 비밀번호로 로그인
- **찜하기**: 각 질문에서 찜하기 버튼 클릭
- **마이페이지**: 찜한 질문 목록 확인

### 질문 추가/수정 (관리자)

#### 새 질문 추가

1. `questions/[카테고리]/` 폴더에 새 `.md` 파일 생성
2. 다음 형식으로 작성:

```markdown
---
question: "질문 내용"
shortAnswer: "간단한 답변 (면접에서 말할 내용)"
---

## 상세 설명

여기에 자세한 내용을 Markdown 형식으로 작성...

### 소제목

- 리스트 항목
- 코드 블록도 사용 가능

\`\`\`bash
명령어 예시
\`\`\`
```

#### 기존 질문 수정

해당 카테고리 폴더의 `.md` 파일을 직접 수정하면 됩니다.

#### 새 카테고리 추가

1. `lib/questions.ts` 파일의 `categories` 객체에 새 카테고리 추가:
```typescript
const categories: Record<string, { name: string; description: string }> = {
  // ... 기존 카테고리
  security: { name: '보안', description: '보안 관련 질문' },
}
```

2. `questions/` 폴더에 해당 카테고리 폴더 생성:
```bash
mkdir questions/security
```

## 배포하기

### Vercel 배포 (추천)

#### 방법 1: GitHub 연동

1. GitHub에 저장소 생성 및 코드 푸시
2. [Vercel](https://vercel.com) 접속 및 로그인
3. "New Project" 클릭
4. GitHub 저장소 선택
5. 환경 변수 설정:
   - `MONGODB_URI`: MongoDB Atlas 연결 문자열
   - `NEXTAUTH_URL`: 배포된 URL (예: https://your-app.vercel.app)
   - `NEXTAUTH_SECRET`: 랜덤 문자열
   - `ADMIN_EMAIL`: 관리자 이메일
6. "Deploy" 클릭

#### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add MONGODB_URI
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add ADMIN_EMAIL

# 프로덕션 배포
vercel --prod
```

### MongoDB Atlas 설정 (프로덕션)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 무료 클러스터 생성
2. Network Access에서 `0.0.0.0/0` 추가 (모든 IP 허용)
3. Database User 생성
4. 연결 문자열 복사하여 Vercel 환경 변수에 추가

## 프로젝트 구조

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth API
│   │   │   └── signup/route.ts         # 회원가입 API
│   │   └── favorites/route.ts          # 찜하기 API
│   ├── auth/
│   │   ├── signin/page.tsx             # 로그인 페이지
│   │   └── signup/page.tsx             # 회원가입 페이지
│   ├── category/
│   │   └── [id]/
│   │       ├── page.tsx                # 카테고리별 질문 목록
│   │       └── [questionId]/page.tsx   # 질문 상세 페이지
│   ├── mypage/page.tsx                 # 마이페이지
│   ├── page.tsx                        # 홈 페이지
│   ├── layout.tsx                      # 레이아웃
│   └── globals.css                     # 전역 스타일
├── components/
│   ├── FavoriteButton.tsx              # 찜하기 버튼
│   ├── Header.tsx                      # 헤더/네비게이션
│   ├── SessionProvider.tsx             # 세션 프로바이더
│   └── SignOutButton.tsx               # 로그아웃 버튼
├── lib/
│   ├── auth.ts                         # NextAuth 설정
│   ├── mongodb.ts                      # MongoDB 연결
│   └── questions.ts                    # 질문 데이터 로드
├── questions/                          # 질문 Markdown 파일들
│   ├── network/
│   ├── linux/
│   ├── cloud/
│   ├── container/
│   └── cicd/
├── types/
│   └── next-auth.d.ts                  # NextAuth 타입 정의
├── .env.local                          # 환경 변수
└── package.json
```

## 기술 스택

- **프론트엔드**: Next.js 14 (App Router), React, TypeScript
- **인증**: NextAuth.js
- **데이터베이스**: MongoDB
- **스타일링**: CSS
- **배포**: Vercel

## 데이터베이스 스키마

### users 컬렉션
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  role: String ('admin' | 'user'),
  createdAt: Date
}
```

### favorites 컬렉션
```javascript
{
  _id: ObjectId,
  userId: String,
  categoryId: String,
  questionId: String,
  createdAt: Date
}
```

## 보안

- 비밀번호는 bcrypt로 해시화되어 저장
- NextAuth JWT 기반 세션 관리
- 환경 변수로 민감 정보 관리
- MongoDB 연결 문자열 보호

## 라이선스

MIT
