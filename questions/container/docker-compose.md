---
question: "Docker Compose란 무엇이며 언제 사용하나요?"
shortAnswer: "Docker Compose는 여러 컨테이너를 정의하고 실행하는 도구입니다. YAML 파일로 서비스를 정의하고 단일 명령으로 전체 애플리케이션 스택을 시작/중지할 수 있습니다. 개발 환경, 테스트, 소규모 프로덕션에 적합합니다."
---

## Docker Compose 완벽 가이드

### Docker Compose란?

여러 컨테이너로 구성된 애플리케이션을 정의하고 실행하기 위한 도구입니다.

### 주요 특징

- **선언적 설정**: YAML 파일로 정의
- **단일 명령**: 전체 스택 관리
- **네트워킹**: 자동 네트워크 생성
- **볼륨 관리**: 데이터 영속성
- **환경 변수**: 설정 관리

### 기본 구조

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    depends_on:
      - api
  
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
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

### 주요 명령어

```bash
# 서비스 시작 (백그라운드)
docker-compose up -d

# 서비스 중지
docker-compose down

# 서비스 중지 및 볼륨 삭제
docker-compose down -v

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f web

# 서비스 목록
docker-compose ps

# 서비스 재시작
docker-compose restart

# 서비스 빌드
docker-compose build

# 빌드 후 시작
docker-compose up --build

# 특정 서비스만 실행
docker-compose up web

# 스케일링
docker-compose up --scale api=3
```

### 실전 예제

#### 1. WordPress + MySQL

```yaml
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: secret
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress-data:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: secret
      MYSQL_ROOT_PASSWORD: rootsecret
    volumes:
      - db-data:/var/lib/mysql

volumes:
  wordpress-data:
  db-data:
```

#### 2. Node.js + MongoDB + Redis

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://mongo:27017/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  mongo-data:
```

#### 3. 마이크로서비스 아키텍처

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - user-service
      - product-service

  user-service:
    build: ./services/user
    environment:
      - DB_HOST=postgres
    depends_on:
      - postgres

  product-service:
    build: ./services/product
    environment:
      - DB_HOST=postgres
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

### 고급 기능

#### 환경 변수 파일

```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env
      - .env.local
```

```bash
# .env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
```

#### 헬스체크

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### 리소스 제한

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

#### 네트워크 설정

```yaml
services:
  web:
    networks:
      - frontend
  
  api:
    networks:
      - frontend
      - backend
  
  db:
    networks:
      - backend

networks:
  frontend:
  backend:
```

### 베스트 프랙티스

1. **버전 명시**
   ```yaml
   version: '3.8'
   ```

2. **환경별 설정 분리**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
   ```

3. **볼륨 사용**
   - 데이터 영속성
   - 개발 시 코드 동기화

4. **의존성 관리**
   ```yaml
   depends_on:
     - db
   ```

5. **헬스체크 추가**
   - 서비스 준비 상태 확인

6. **로그 관리**
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

### Docker Compose vs Kubernetes

| 특성 | Docker Compose | Kubernetes |
|------|----------------|------------|
| 복잡도 | 낮음 | 높음 |
| 확장성 | 제한적 | 뛰어남 |
| 용도 | 개발, 소규모 | 프로덕션, 대규모 |
| 학습 곡선 | 완만 | 가파름 |
| 오케스트레이션 | 기본 | 고급 |

### 실무 활용

- **로컬 개발 환경**: 전체 스택 로컬 실행
- **CI/CD**: 통합 테스트 환경
- **소규모 배포**: 단일 서버 배포
- **프로토타이핑**: 빠른 검증
