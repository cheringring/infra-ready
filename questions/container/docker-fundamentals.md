---
question: "Docker의 기본 개념과 컨테이너 vs 가상머신의 차이점, 그리고 Docker 명령어와 Dockerfile 작성 방법을 설명해주세요."
shortAnswer: "Docker는 컨테이너 기반 가상화 기술로, VM보다 가볍고 빠릅니다. docker run으로 컨테이너 실행, Dockerfile로 이미지 빌드하며, 애플리케이션과 의존성을 패키징하여 어디서나 동일하게 실행할 수 있습니다."
---

# Docker 기초 개념

## 컨테이너 vs 가상머신

### 가상머신 (VM) vs 컨테이너 비교
#### 가상머신 특징:
- **구조**: Host OS → Hypervisor → Guest OS (완전한 OS) → App
- **장점**: 완전한 격리, 다른 OS 실행 가능
- **단점**: 리소스 사용량 많음, 부팅 시간 오래 걸림
- **용량**: GB 단위 (OS 포함)

#### 컨테이너 특징:
- **구조**: Host OS → Docker Engine → Container (App + 라이브러리만)
- **장점**: 가볍고 빠름, 리소스 효율적, 초 단위 시작
- **단점**: 같은 OS 커널만 사용 가능
- **용량**: MB 단위 (애플리케이션만)

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

### 이미지 관리 명령어
- **`docker search nginx`**: Docker Hub에서 nginx 이미지 검색
- **`docker pull nginx:latest`**: nginx 최신 이미지 다운로드
- **`docker images`**: 로컬에 저장된 이미지 목록 확인
- **`docker rmi nginx:latest`**: nginx 이미지 삭제
- **`docker build -t myapp:1.0 .`**: 현재 디렉토리 Dockerfile로 myapp:1.0 이미지 빌드

### 컨테이너 관리 명령어
- **`docker run -d -p 80:80 --name webserver nginx`**: 
  - `-d`: 백그라운드 실행 (detached)
  - `-p 80:80`: 호스트 80포트를 컨테이너 80포트로 연결
  - `--name webserver`: 컨테이너 이름 지정
- **`docker ps`**: 실행 중인 컨테이너 목록 확인
- **`docker ps -a`**: 모든 컨테이너 (중지된 것 포함) 확인
- **`docker stop webserver`**: webserver 컨테이너 중지
- **`docker start webserver`**: 중지된 webserver 컨테이너 시작
- **`docker rm webserver`**: webserver 컨테이너 삭제
- **`docker logs webserver`**: webserver 컨테이너 로그 확인
- **`docker exec -it webserver bash`**: 
  - `-i`: 인터랙티브 모드
  - `-t`: TTY 할당
  - 실행 중인 컨테이너 내부로 bash 접속

### 시스템 관리 명령어
- **`docker system df`**: Docker 디스크 사용량 확인 (이미지, 컨테이너, 볼륨별)
- **`docker system prune`**: 사용하지 않는 리소스 정리 (중지된 컨테이너, 미사용 이미지 등)
- **`docker network ls`**: Docker 네트워크 목록 확인
- **`docker volume ls`**: Docker 볼륨 목록 확인
- **`docker info`**: Docker 시스템 전체 정보 확인

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

### Dockerfile 최적화 기법
#### 캐시 최적화:
- **레이어 순서**: 자주 변경되지 않는 파일을 먼저 복사 (package.json → 소스코드)
- **`npm ci --only=production`**: package-lock.json 기반 정확한 의존성 설치

### Java 애플리케이션 Docker화
#### Spring Boot 애플리케이션 Dockerfile:
- **`FROM openjdk:17-jre-slim`**: 경량화된 OpenJDK 런타임 이미지
- **`WORKDIR /app`**: 애플리케이션 작업 디렉토리 설정
- **`COPY target/*.jar app.jar`**: 빌드된 JAR 파일 복사
- **`EXPOSE 8080`**: Spring Boot 기본 포트 노출
- **`ENTRYPOINT ["java", "-jar", "app.jar"]`**: JAR 실행 명령어

#### Java 멀티스테이지 빌드:
- **빌드 스테이지**: `FROM maven:3.8-openjdk-17` Maven으로 빌드
- **런타임 스테이지**: `FROM openjdk:17-jre-slim` JRE만 포함
- **JAR 복사**: `COPY --from=builder /app/target/*.jar app.jar`
- **이미지 크기 감소**: 빌드 도구 제외로 50% 이상 크기 절약

#### JVM 옵션 설정:
- **`ENV JAVA_OPTS="-Xms512m -Xmx1024m"`**: 메모리 설정
- **`ENV SPRING_PROFILES_ACTIVE=prod`**: Spring 프로파일 설정
- **컨테이너 인식**: `-XX:+UseContainerSupport` JVM이 컨테이너 리소스 인식

## Docker Compose

### Docker Compose 핵심 개념
#### 주요 구성 요소:
- **`version: '3.8'`**: Compose 파일 버전 지정
- **`services:`**: 여러 컨테이너를 하나의 애플리케이션으로 정의
- **`build: .`**: 현재 디렉토리 Dockerfile로 이미지 빌드
- **`image: mysql:8.0`**: 기존 이미지 사용
- **`ports: - "3000:3000"`**: 포트 매핑 (호스트:컨테이너)
- **`environment:`**: 환경 변수 설정
- **`depends_on:`**: 서비스 간 의존성 정의
- **`volumes:`**: 데이터 영속성을 위한 볼륨 마운트

#### Java 애플리케이션 스택 구성:
- **애플리케이션**: Spring Boot JAR 파일
- **데이터베이스**: MySQL 또는 PostgreSQL 컨테이너
- **캐시**: Redis 컨테이너 (세션 저장, 캐싱)
- **프록시**: Nginx 리버스 프록시 (로드 밸런싱)

#### Spring Boot + MySQL + Redis 구성 예시:
- **`app` 서비스**: Spring Boot 애플리케이션 (포트 8080)
- **`mysql` 서비스**: MySQL 8.0 데이터베이스 (포트 3306)
- **`redis` 서비스**: Redis 캐시 서버 (포트 6379)
- **환경 변수**: `SPRING_DATASOURCE_URL`, `SPRING_REDIS_HOST` 설정
- **의존성**: `depends_on`으로 서비스 시작 순서 제어

#### Docker Compose 명령어:
- **`docker-compose up -d`**: 모든 서비스를 백그라운드에서 시작
- **`docker-compose down`**: 모든 서비스 중지 및 제거
- **`docker-compose ps`**: 실행 중인 서비스 상태 확인
- **`docker-compose logs app`**: Spring Boot 애플리케이션 로그 확인
- **`docker-compose exec app bash`**: 애플리케이션 컨테이너에 접속

### Docker Compose 고급 기능
- **`docker-compose up --scale web=3`**: web 서비스를 3개 인스턴스로 스케일링
- **`docker-compose restart web`**: 특정 서비스만 재시작
- **`docker-compose build`**: 모든 서비스 이미지 다시 빌드
- **`docker-compose pull`**: 최신 이미지로 업데이트
- **`docker-compose config`**: Compose 파일 문법 검증

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
