---
question: "Docker란 무엇이며 왜 사용하나요?"
shortAnswer: "Docker는 컨테이너 기반 가상화 플랫폼입니다. 애플리케이션과 의존성을 컨테이너로 패키징하여 어디서나 동일하게 실행할 수 있습니다. 가볍고 빠르며, 환경 일관성을 보장하고, 마이크로서비스 아키텍처에 적합합니다."
---

## Docker 완벽 가이드

### Docker란?

Docker는 컨테이너 기술을 사용하여 애플리케이션을 개발, 배포, 실행하는 오픈소스 플랫폼입니다.

### 왜 Docker를 사용하는가?

#### 1. 환경 일관성
- "내 컴퓨터에서는 되는데..." 문제 해결
- 개발, 테스트, 프로덕션 환경 동일화
- 의존성 충돌 방지

#### 2. 가볍고 빠름
- VM보다 훨씬 가벼움 (MB 단위)
- 초 단위로 시작/종료
- 호스트 OS 커널 공유

#### 3. 이식성
- 어디서나 실행 가능 (로컬, 클라우드, 온프레미스)
- 플랫폼 독립적

#### 4. 확장성
- 마이크로서비스 아키텍처에 최적
- 쉬운 스케일링

### 주요 개념

#### 이미지 (Image)
- 컨테이너 실행에 필요한 파일과 설정을 포함한 템플릿
- 읽기 전용
- 레이어 구조로 구성

#### 컨테이너 (Container)
- 이미지의 실행 인스턴스
- 격리된 환경에서 실행
- 읽기/쓰기 가능

#### Dockerfile
- 이미지를 만들기 위한 스크립트
- 명령어들의 집합

#### Docker Hub
- 공식 이미지 저장소
- 퍼블릭/프라이빗 레지스트리

### 기본 명령어

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
docker exec -it webserver /bin/bash
```

### Dockerfile 예시

```dockerfile
# 베이스 이미지
FROM node:18-alpine

# 작업 디렉토리 설정
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

### Docker Compose

여러 컨테이너를 정의하고 실행하는 도구

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f
```

### 네트워킹

#### 네트워크 타입
- **bridge**: 기본 네트워크, 같은 호스트의 컨테이너 간 통신
- **host**: 호스트 네트워크 직접 사용
- **none**: 네트워크 없음
- **overlay**: 여러 호스트 간 통신 (Swarm)

```bash
# 네트워크 생성
docker network create mynetwork

# 네트워크에 컨테이너 연결
docker run --network mynetwork nginx
```

### 볼륨 (Volume)

데이터 영속성을 위한 저장소

```bash
# 볼륨 생성
docker volume create mydata

# 볼륨 사용
docker run -v mydata:/data nginx

# 호스트 디렉토리 마운트
docker run -v /host/path:/container/path nginx
```

### 베스트 프랙티스

#### 1. 이미지 최적화
- 작은 베이스 이미지 사용 (alpine)
- 멀티 스테이지 빌드
- 불필요한 파일 제외 (.dockerignore)
- 레이어 캐싱 활용

#### 2. 보안
- 최신 이미지 사용
- 루트 사용자 피하기
- 비밀 정보는 환경 변수나 시크릿 사용
- 이미지 스캔 (Trivy, Snyk)

#### 3. 로깅
- 표준 출력(stdout) 사용
- 로그 드라이버 설정
- 로그 로테이션

#### 4. 리소스 제한
```bash
docker run --memory="512m" --cpus="1.0" nginx
```

### VM vs Docker

| 특성 | VM | Docker |
|------|-----|--------|
| 크기 | GB 단위 | MB 단위 |
| 시작 시간 | 분 단위 | 초 단위 |
| 성능 | 오버헤드 있음 | 네이티브에 가까움 |
| 격리 수준 | 완전 격리 | 프로세스 수준 격리 |
| OS | 각각 필요 | 호스트 OS 공유 |

### 실무 활용 사례

1. **마이크로서비스**: 각 서비스를 독립적인 컨테이너로 실행
2. **CI/CD**: 일관된 빌드 환경 제공
3. **개발 환경**: 팀원 간 동일한 개발 환경
4. **테스트**: 격리된 환경에서 테스트 실행
5. **레거시 애플리케이션**: 컨테이너화하여 현대적 인프라에서 실행
