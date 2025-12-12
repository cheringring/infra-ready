# 설치 및 실행 가이드

## 1단계: MongoDB 설치 및 실행

### 옵션 A: Docker 사용 (가장 쉬움)

```bash
# MongoDB 컨테이너 실행
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 확인
docker ps
```

### 옵션 B: macOS에 직접 설치

```bash
# Homebrew로 설치
brew tap mongodb/brew
brew install mongodb-community

# 실행
brew services start mongodb-community

# 또는 포그라운드 실행
mongod --config /opt/homebrew/etc/mongod.conf
```

### 옵션 C: MongoDB Atlas (클라우드)

1. https://www.mongodb.com/cloud/atlas 접속
2. 무료 계정 생성
3. 무료 클러스터 생성 (M0)
4. Database Access에서 사용자 생성
5. Network Access에서 IP 추가 (0.0.0.0/0)
6. Connect 버튼 클릭 → 연결 문자열 복사

## 2단계: 환경 변수 설정

`.env.local` 파일을 열고 수정:

```env
# 로컬 MongoDB 사용 시
MONGODB_URI=mongodb://localhost:27017/interview-questions

# 또는 MongoDB Atlas 사용 시
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interview-questions

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=아무거나-긴-랜덤-문자열-입력

# 관리자 이메일 (이 이메일로 가입하면 관리자 권한)
ADMIN_EMAIL=admin@example.com
```

## 3단계: 의존성 설치

```bash
npm install
```

## 4단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 5단계: 관리자 계정 생성

1. 회원가입 버튼 클릭
2. `.env.local`의 `ADMIN_EMAIL`과 동일한 이메일로 가입
3. 자동으로 관리자 권한 부여됨

## 테스트

1. **회원가입**: 새 계정 생성
2. **로그인**: 생성한 계정으로 로그인
3. **질문 찜하기**: 카테고리 → 질문 → 찜하기 버튼 클릭
4. **마이페이지**: 찜한 질문 확인

## 문제 해결

### MongoDB 연결 오류

```bash
# MongoDB가 실행 중인지 확인
# Docker 사용 시
docker ps

# 로컬 설치 시
brew services list
```

### 포트 충돌

```bash
# 3000 포트가 사용 중이면 다른 포트로 실행
PORT=3001 npm run dev
```

### 환경 변수 오류

- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 서버 재시작 (환경 변수 변경 시 필수)

## 배포 준비

### Vercel 배포 전 체크리스트

- [ ] MongoDB Atlas 클러스터 생성
- [ ] Network Access에서 0.0.0.0/0 추가
- [ ] 연결 문자열 확인
- [ ] GitHub에 코드 푸시
- [ ] Vercel에서 환경 변수 설정
- [ ] 배포 후 관리자 계정 생성

### 환경 변수 (Vercel)

```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=랜덤-문자열
ADMIN_EMAIL=admin@example.com
```
