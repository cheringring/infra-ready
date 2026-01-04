---
question: "GitHub Actions란 무엇인가요?"
shortAnswer: "GitHub Actions는 GitHub에 통합된 CI/CD 플랫폼입니다. YAML 파일로 워크플로우를 정의하고, GitHub 이벤트(push, PR 등)에 반응하여 자동으로 빌드, 테스트, 배포를 실행합니다. GitHub Marketplace의 수천 개 액션을 재사용할 수 있습니다."
---

## GitHub Actions 완벽 가이드

### GitHub Actions란?

GitHub 저장소에서 직접 소프트웨어 워크플로우를 자동화할 수 있는 CI/CD 플랫폼입니다.

### 주요 개념

#### Workflow
- 자동화된 프로세스
- `.github/workflows/` 디렉토리의 YAML 파일

#### Event
- 워크플로우를 트리거하는 활동
- push, pull_request, schedule 등

#### Job
- 같은 러너에서 실행되는 스텝 그룹
- 병렬 또는 순차 실행

#### Step
- 개별 작업 단위
- 액션 실행 또는 쉘 명령

#### Action
- 재사용 가능한 작업 단위
- Marketplace에서 공유

#### Runner
- 워크플로우를 실행하는 서버
- GitHub 호스팅 또는 Self-hosted

### 기본 워크플로우

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
```

### 실전 예제

#### Node.js CI/CD
```yaml
name: Node.js CI/CD

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 유용한 기능

#### Secrets 관리
```yaml
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: ./deploy.sh
```

#### Matrix 빌드
```yaml
strategy:
  matrix:
    node-version: [14, 16, 18]
    os: [ubuntu-latest, windows-latest]
```

#### 조건부 실행
```yaml
steps:
  - name: Deploy to production
    if: github.ref == 'refs/heads/main'
    run: ./deploy-prod.sh
```

### 베스트 프랙티스

1. **워크플로우 분리**: CI와 CD 분리
2. **캐싱 활용**: 빌드 시간 단축
3. **Secrets 사용**: 민감 정보 보호
4. **재사용 가능한 워크플로우**: DRY 원칙
5. **적절한 트리거**: 불필요한 실행 방지
