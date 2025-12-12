---
question: "CI/CD란 무엇이며 왜 필요한가요?"
shortAnswer: "CI/CD는 지속적 통합(Continuous Integration)과 지속적 배포(Continuous Deployment)의 약자입니다. 코드 변경사항을 자동으로 빌드, 테스트, 배포하여 개발 속도를 높이고 버그를 빠르게 발견하며 배포 리스크를 줄입니다."
---

## CI/CD 완벽 가이드

### CI (Continuous Integration) - 지속적 통합

#### 개념
개발자들이 코드를 공유 저장소에 자주 통합하고, 각 통합마다 자동으로 빌드와 테스트를 실행하는 프랙티스

#### 주요 프로세스
1. 코드 커밋
2. 자동 빌드
3. 자동 테스트 실행
4. 결과 피드백

#### 장점
- 버그 조기 발견
- 통합 문제 최소화
- 코드 품질 향상
- 개발 속도 증가

### CD (Continuous Deployment/Delivery)

#### Continuous Delivery (지속적 전달)
- 프로덕션 배포 준비가 항상 되어 있는 상태
- 수동 승인 후 배포

#### Continuous Deployment (지속적 배포)
- 모든 변경사항이 자동으로 프로덕션에 배포
- 완전 자동화

### 주요 도구

#### CI/CD 플랫폼
- **Jenkins**: 오픈소스, 플러그인 풍부
- **GitLab CI/CD**: GitLab 통합
- **GitHub Actions**: GitHub 통합
- **CircleCI**: 클라우드 기반
- **Travis CI**: 오픈소스 프로젝트에 인기

### 파이프라인 예시

```yaml
# GitHub Actions 예시
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: npm run build
      - name: Test
        run: npm test
      - name: Deploy
        run: ./deploy.sh
```

### 베스트 프랙티스

1. **자주 커밋**: 작은 단위로 자주 통합
2. **빠른 빌드**: 10분 이내 목표
3. **자동화된 테스트**: 단위, 통합, E2E 테스트
4. **환경 일관성**: 개발/스테이징/프로덕션 동일
5. **롤백 계획**: 문제 발생 시 빠른 복구
