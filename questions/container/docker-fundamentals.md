---
question: "Docker의 기본 개념과 컨테이너 vs 가상머신의 차이점, 그리고 Docker 명령어와 Dockerfile 작성 방법을 설명해주세요."
shortAnswer: "Docker는 컨테이너 기반 가상화 기술로, VM보다 가볍고 빠릅니다. docker run으로 컨테이너 실행, Dockerfile로 이미지 빌드하며, 애플리케이션과 의존성을 패키징하여 어디서나 동일하게 실행할 수 있습니다."
---

# Docker 기초 개념

## 컨테이너 vs 가상머신

### 가상머신 (VM)
```
Host OS
├── Hypervisor
├── Guest OS 1 (전체 OS)
│   └── App 1
├── Guest OS 2 (전체 OS)
│   └── App 2
└── Guest OS 3 (전체 OS)
    └── App 3
```
- **특징**: 각각 완전한 OS 포함
- **장점**: 완전한 격리, 다른 OS 실행 가능
- **단점**: 리소스 사용량 많음, 부팅 시간 오래 걸림

### 컨테이너
```
Host OS
├── Docker Engine
├── Container 1 (App + 라이브러리)
├── Container 2 (App + 라이브러리)
└── Container 3 (App + 라이브러리)
```
- **특징**: OS 커널 공유, 프로세스 레벨 격리
- **장점**: 가볍고 빠름, 리소스 효율적
- **단점**: 같은 OS 커널만 사용 가능

## Docker 핵심 개념

### 이미지 (Image)
- **정의**: 컨테이너 실행을 위한 템플릿
- **특징**: 읽기 전용, 레이어 구조
- **예시**: `nginx:latest`, `ubuntu:20.04`

### 컨테이너 (Container)
- **정의**: 이미지를 실행한 인스턴스
- **특징**: 실행 중인 프로세스, 격리된 환경

### 레지스트리 (Registry)
- **Docker Hub**: 공식 이미지 저장소
- **Private Registry**: 기업 내부 이미지 저장소

## 기본 Docker 명령어

### 이미지 관리
```bash
# 이미지 검색
docker search nginx

# 이미지 다운로드
docker pull nginx:latest

# 이미지 목록 확인
docker images

# 이미지 삭제
docker rmi nginx:latest

# 이미지 빌드
docker build -t myapp:1.0 .
```

### 컨테이너 관리
```bash
# 컨테이너 실행
docker run -d -p 80:80 --name webserver nginx

# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인
docker ps -a

# 컨테이너 중지
docker stop webserver

# 컨테이너 시작
docker start webserver

# 컨테이너 삭제
docker rm webserver

# 컨테이너 로그 확인
docker logs webserver

# 컨테이너 내부 접속
docker exec -it webserver bash
```

### 시스템 관리
```bash
# 디스크 사용량 확인
docker system df

# 사용하지 않는 리소스 정리
docker system prune

# 네트워크 목록
docker network ls

# 볼륨 목록
docker volume ls
```

## Dockerfile 작성

### 기본 구조
```dockerfile
# 베이스 이미지 지정
FROM ubuntu:20.04

# 메타데이터 설정
LABEL maintainer="developer@company.com"
LABEL version="1.0"

# 환경 변수 설정
ENV APP_HOME=/app
ENV NODE_ENV=production

# 작업 디렉토리 설정
WORKDIR $APP_HOME

# 패키지 설치
RUN apt-get update && \
    apt-get install -y nodejs npm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 파일 복사
COPY package*.json ./
COPY . .

# 의존성 설치
RUN npm install --production

# 포트 노출
EXPOSE 3000

# 사용자 설정 (보안)
RUN useradd -m appuser
USER appuser

# 컨테이너 시작 명령
CMD ["node", "app.js"]
```

### Node.js 애플리케이션 예시
```dockerfile
FROM node:16-alpine

WORKDIR /app

# package.json 먼저 복사 (캐시 최적화)
COPY package*.json ./
RUN npm ci --only=production

# 애플리케이션 코드 복사
COPY . .

# 비root 사용자로 실행
USER node

EXPOSE 3000

CMD ["node", "server.js"]
```

### Python 애플리케이션 예시
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 비root 사용자 생성 및 전환
RUN useradd --create-home --shell /bin/bash app
USER app

EXPOSE 8000

CMD ["python", "app.py"]
```

## Docker Compose

### docker-compose.yml 예시
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myapp
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppassword
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  db_data:
```

### Compose 명령어
```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs web

# 스케일링
docker-compose up -d --scale web=3
```

## 네트워킹

### 네트워크 타입
- **bridge**: 기본 네트워크, 같은 호스트 내 컨테이너 통신
- **host**: 호스트 네트워크 직접 사용
- **none**: 네트워크 없음
- **overlay**: 여러 호스트 간 컨테이너 통신

### 네트워크 관리
```bash
# 네트워크 생성
docker network create mynetwork

# 컨테이너를 특정 네트워크에 연결
docker run -d --network mynetwork --name app1 nginx

# 네트워크 상세 정보
docker network inspect mynetwork
```

## 볼륨과 데이터 관리

### 볼륨 타입
```bash
# Named Volume
docker run -v myvolume:/data nginx

# Bind Mount
docker run -v /host/path:/container/path nginx

# tmpfs Mount (메모리)
docker run --tmpfs /tmp nginx
```

### 데이터 백업
```bash
# 볼륨 백업
docker run --rm -v myvolume:/data -v $(pwd):/backup ubuntu tar czf /backup/backup.tar.gz -C /data .

# 볼륨 복원
docker run --rm -v myvolume:/data -v $(pwd):/backup ubuntu tar xzf /backup/backup.tar.gz -C /data
```

## 보안 모범 사례

### Dockerfile 보안
```dockerfile
# 1. 최소한의 베이스 이미지 사용
FROM alpine:latest

# 2. 비root 사용자 사용
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup
USER appuser

# 3. 불필요한 패키지 설치 금지
RUN apk add --no-cache nodejs npm

# 4. 민감한 정보 하드코딩 금지
# 환경 변수나 시크릿 사용
```

### 런타임 보안
```bash
# 읽기 전용 파일시스템
docker run --read-only nginx

# 권한 제한
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx

# 리소스 제한
docker run -m 512m --cpus="1.0" nginx
```

## 실무 시나리오

### 1. 개발 환경 구성
```bash
# 개발용 컨테이너 (코드 변경 시 자동 반영)
docker run -d -p 3000:3000 -v $(pwd):/app -w /app node:16 npm run dev
```

### 2. 프로덕션 배포
```bash
# 멀티 스테이지 빌드로 최적화
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

### 3. 로그 관리
```bash
# 로그 드라이버 설정
docker run -d --log-driver=json-file --log-opt max-size=10m --log-opt max-file=3 nginx
```

## 신입 면접 핵심 포인트

### 1. Docker의 장점
- **일관성**: "내 컴퓨터에서는 잘 되는데" 문제 해결
- **확장성**: 마이크로서비스 아키텍처 지원
- **효율성**: 리소스 사용량 최적화

### 2. 실무 활용
- **CI/CD**: 빌드, 테스트, 배포 자동화
- **개발 환경**: 팀원 간 동일한 개발 환경
- **마이크로서비스**: 서비스별 독립적 배포

### 3. 문제 해결
- **컨테이너가 시작되지 않을 때**: `docker logs` 확인
- **포트 접근 안 될 때**: 포트 매핑 확인
- **이미지 크기가 클 때**: 멀티 스테이지 빌드 사용

### 4. 실무 질문 대비
- "Docker와 VM의 차이점을 설명해주세요"
- "Dockerfile에서 레이어를 최적화하는 방법은?"
- "컨테이너 간 통신은 어떻게 구현하나요?"
- "프로덕션에서 Docker 사용 시 주의사항은?"
