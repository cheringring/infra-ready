---
question: "Docker가 무엇이고, 가상 머신(VM)과 어떻게 다른가요?"
shortAnswer: "Docker는 컨테이너 기반 가상화 기술로, 애플리케이션을 격리된 환경에서 실행합니다. VM은 하이퍼바이저 위에 전체 OS를 실행하지만, Docker는 호스트 OS 커널을 공유하여 더 가볍고 빠릅니다."
---

## 상세 답변

### Docker란?

**정의**
- 컨테이너 기반의 오픈소스 가상화 플랫폼
- 애플리케이션과 의존성을 패키징하여 어디서나 동일하게 실행
- "Build once, Run anywhere"

**핵심 개념**
```
이미지 (Image)
- 애플리케이션 실행에 필요한 모든 것을 포함
- 읽기 전용 템플릿
- Dockerfile로 생성

컨테이너 (Container)
- 이미지의 실행 인스턴스
- 격리된 프로세스
- 가볍고 빠름

레지스트리 (Registry)
- 이미지 저장소
- Docker Hub, ECR, GCR
```

### VM vs Docker

#### 아키텍처 비교

```
가상 머신 (VM)
┌─────────────────────────────┐
│   App A   │   App B          │
│  Bins/Libs│  Bins/Libs       │
├───────────┼──────────────────┤
│  Guest OS │  Guest OS        │ ← 각각 전체 OS
├───────────┴──────────────────┤
│      Hypervisor              │ ← 하이퍼바이저
├──────────────────────────────┤
│      Host OS                 │
├──────────────────────────────┤
│      Infrastructure          │
└──────────────────────────────┘

Docker 컨테이너
┌─────────────────────────────┐
│   App A   │   App B          │
│  Bins/Libs│  Bins/Libs       │
├───────────┴──────────────────┤
│   Docker Engine              │ ← Docker 엔진
├──────────────────────────────┤
│      Host OS                 │ ← OS 커널 공유
├──────────────────────────────┤
│      Infrastructure          │
└──────────────────────────────┘
```

#### 비교표

| 특성 | 가상 머신 (VM) | Docker 컨테이너 |
|------|---------------|----------------|
| OS | 각 VM마다 전체 OS | 호스트 OS 커널 공유 |
| 크기 | GB 단위 | MB 단위 |
| 시작 시간 | 분 단위 | 초 단위 |
| 성능 | 오버헤드 있음 | 거의 네이티브 |
| 격리 수준 | 강함 (하드웨어 수준) | 중간 (프로세스 수준) |
| 이식성 | 낮음 | 높음 |
| 리소스 효율 | 낮음 | 높음 |

### Docker의 장점

#### 1. 일관성
```bash
# 개발 환경
docker run -p 3000:3000 myapp

# 프로덕션 환경
docker run -p 3000:3000 myapp

# 동일한 이미지, 동일한 동작!
```

**"내 컴퓨터에서는 되는데..." 문제 해결**

#### 2. 격리성
```bash
# 각 컨테이너는 독립적
docker run --name app1 -p 3001:3000 myapp
docker run --name app2 -p 3002:3000 myapp

# 서로 영향 없음
```

#### 3. 이식성
```bash
# 어디서나 실행 가능
- 개발자 노트북
- 테스트 서버
- 프로덕션 서버
- 클라우드 (AWS, Azure, GCP)
```

#### 4. 효율성
```
VM: 10개 실행 = 10개의 OS
Docker: 10개 실행 = 1개의 OS + 10개의 컨테이너
→ 메모리, CPU 절약
```

### Docker 기본 명령어

#### 이미지 관리
```bash
# 이미지 검색
docker search nginx

# 이미지 다운로드
docker pull nginx:latest

# 이미지 목록
docker images

# 이미지 삭제
docker rmi nginx:latest

# 이미지 빌드
docker build -t myapp:1.0 .
```

#### 컨테이너 관리
```bash
# 컨테이너 실행
docker run -d -p 80:80 --name web nginx

# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인
docker ps -a

# 컨테이너 중지
docker stop web

# 컨테이너 시작
docker start web

# 컨테이너 재시작
docker restart web

# 컨테이너 삭제
docker rm web

# 컨테이너 로그
docker logs web
docker logs -f web  # 실시간

# 컨테이너 접속
docker exec -it web bash
```

### Dockerfile 작성

#### 기본 구조
```dockerfile
# 베이스 이미지
FROM node:18-alpine

# 작업 디렉토리
WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# 포트 노출
EXPOSE 3000

# 실행 명령
CMD ["npm", "start"]
```

#### 멀티 스테이지 빌드
```dockerfile
# 빌드 스테이지
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 실행 스테이지
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**장점**: 최종 이미지 크기 감소

### Docker Compose

#### docker-compose.yml
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://db:5432/mydb
    depends_on:
      - db
    volumes:
      - ./src:/app/src

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

#### 명령어
```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f

# 특정 서비스만 재시작
docker-compose restart web
```

### 실무 활용

#### 1. 개발 환경 통일
```bash
# 팀원 모두 동일한 환경
git clone project
docker-compose up
# 끝!
```

#### 2. 마이크로서비스
```
각 서비스를 독립적인 컨테이너로 실행
- 사용자 서비스: user-service:1.0
- 주문 서비스: order-service:1.0
- 결제 서비스: payment-service:1.0
```

#### 3. CI/CD
```yaml
# GitHub Actions
- name: Build Docker Image
  run: docker build -t myapp:${{ github.sha }} .

- name: Push to Registry
  run: docker push myapp:${{ github.sha }}

- name: Deploy
  run: kubectl set image deployment/myapp myapp=myapp:${{ github.sha }}
```

### Docker 네트워킹

#### 네트워크 종류
```bash
# 브리지 (기본)
docker network create my-network
docker run --network my-network nginx

# 호스트
docker run --network host nginx

# None (격리)
docker run --network none nginx
```

#### 컨테이너 간 통신
```bash
# 같은 네트워크의 컨테이너는 이름으로 통신
docker network create mynet
docker run -d --name db --network mynet postgres
docker run -d --name web --network mynet myapp

# web 컨테이너에서
# postgresql://db:5432 로 접속 가능
```

### Docker 볼륨

#### 데이터 영속성
```bash
# Named Volume
docker volume create mydata
docker run -v mydata:/data nginx

# Bind Mount
docker run -v /host/path:/container/path nginx

# tmpfs (메모리)
docker run --tmpfs /tmp nginx
```

### 보안 고려사항

#### 1. 최소 권한
```dockerfile
# root 대신 일반 사용자
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

#### 2. 최소 이미지
```dockerfile
# Alpine 사용
FROM node:18-alpine  # 작고 안전

# Distroless 사용
FROM gcr.io/distroless/nodejs18  # 더 안전
```

#### 3. 취약점 스캔
```bash
# Trivy로 이미지 스캔
trivy image myapp:latest
```

### 성능 최적화

#### 레이어 캐싱
```dockerfile
# 나쁜 예
COPY . .
RUN npm install

# 좋은 예 (의존성 변경 시에만 재설치)
COPY package*.json ./
RUN npm install
COPY . .
```

#### .dockerignore
```
node_modules
.git
.env
*.log
```

### 문제 해결

#### 컨테이너가 바로 종료될 때
```bash
# 로그 확인
docker logs container_name

# 이전 컨테이너 로그
docker logs --tail 100 container_name
```

#### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000

# 다른 포트 사용
docker run -p 3001:3000 myapp
```

#### 디스크 공간 부족
```bash
# 사용하지 않는 리소스 정리
docker system prune -a

# 볼륨 정리
docker volume prune
```

### 면접 팁

**좋은 답변 구조**:
1. Docker 정의
2. VM과의 차이 (아키텍처)
3. 장점 설명
4. 실무 경험

**예시 답변**:
"Docker는 컨테이너 기반 가상화 기술입니다. VM은 하이퍼바이저 위에 각각 전체 OS를 실행하지만, Docker는 호스트 OS 커널을 공유하여 더 가볍고 빠릅니다. 제 프로젝트에서는 개발 환경을 Docker Compose로 구성해 팀원 모두가 동일한 환경에서 작업할 수 있었고, CI/CD 파이프라인에서 Docker 이미지를 빌드하여 Kubernetes에 배포했습니다."

**추가 질문 대비**:
- "Dockerfile을 작성해본 경험이 있나요?"
- "Docker Compose는 무엇인가요?"
- "컨테이너 오케스트레이션은 왜 필요한가요?"
- "Docker 이미지 크기를 줄이는 방법은?"
