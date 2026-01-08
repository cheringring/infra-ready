---
question: "CI/CD의 개념과 Jenkins를 이용한 파이프라인 구축 방법, 그리고 Git과의 연동 과정을 설명해주세요."
shortAnswer: "CI/CD는 지속적 통합/배포로 코드 변경사항을 자동으로 빌드, 테스트, 배포하는 과정입니다. Jenkins는 Pipeline을 통해 Git webhook으로 자동 트리거되어 빌드부터 배포까지 자동화할 수 있습니다."
---

# CI/CD와 Jenkins

## CI/CD 기본 개념

### CI (Continuous Integration) - 지속적 통합
- **정의**: 개발자들이 코드 변경사항을 자주 메인 브랜치에 통합
- **목적**: 통합 문제를 조기에 발견하고 해결
- **과정**: 코드 커밋 → 자동 빌드 → 자동 테스트 → 피드백

### CD (Continuous Deployment/Delivery) - 지속적 배포
- **Continuous Delivery**: 배포 준비 상태까지 자동화
- **Continuous Deployment**: 프로덕션까지 완전 자동 배포
- **목적**: 배포 주기 단축, 배포 위험 감소

### CI/CD의 장점
```
기존 방식:
개발 → 수동 빌드 → 수동 테스트 → 수동 배포 (주/월 단위)

CI/CD:
개발 → 자동 빌드 → 자동 테스트 → 자동 배포 (일/시간 단위)
```

## Jenkins 기본 구조

### 주요 구성 요소
- **Master**: Jenkins 서버, 작업 스케줄링 및 관리
- **Agent/Slave**: 실제 빌드 작업 수행
- **Job/Project**: 빌드 작업 단위
- **Pipeline**: 코드로 정의된 CI/CD 워크플로우

### Jenkins 설치 및 설정
```bash
# Docker로 Jenkins 실행
docker run -d -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  --name jenkins jenkins/jenkins:lts

# 초기 관리자 패스워드 확인
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## Pipeline 구성

### Declarative Pipeline 예시
```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '16'
        DOCKER_REGISTRY = 'myregistry.com'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/mycompany/myapp.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'test-results.xml'
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/myapp:${BUILD_NUMBER}")
                    docker.withRegistry('https://myregistry.com', 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                sh '''
                    kubectl set image deployment/myapp-staging \
                    myapp=${DOCKER_REGISTRY}/myapp:${BUILD_NUMBER}
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                sh '''
                    kubectl set image deployment/myapp-prod \
                    myapp=${DOCKER_REGISTRY}/myapp:${BUILD_NUMBER}
                '''
            }
        }
    }
    
    post {
        success {
            slackSend channel: '#deployments',
                     message: "✅ Build ${BUILD_NUMBER} deployed successfully"
        }
        failure {
            slackSend channel: '#deployments',
                     message: "❌ Build ${BUILD_NUMBER} failed"
        }
        always {
            cleanWs()
        }
    }
}
```

### Scripted Pipeline 예시
```groovy
node {
    try {
        stage('Checkout') {
            checkout scm
        }
        
        stage('Build') {
            sh 'mvn clean compile'
        }
        
        stage('Test') {
            sh 'mvn test'
            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
        }
        
        stage('Package') {
            sh 'mvn package'
            archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
        }
        
        stage('Deploy') {
            if (env.BRANCH_NAME == 'main') {
                sh 'scp target/*.jar user@server:/opt/app/'
                sh 'ssh user@server "sudo systemctl restart myapp"'
            }
        }
    } catch (Exception e) {
        currentBuild.result = 'FAILURE'
        throw e
    } finally {
        // 정리 작업
        deleteDir()
    }
}
```

## Git 연동

### Webhook 설정
```bash
# GitHub Webhook URL
http://jenkins-server:8080/github-webhook/

# GitLab Webhook URL
http://jenkins-server:8080/project/myproject
```

### 브랜치 전략과 CI/CD
```groovy
pipeline {
    agent any
    stages {
        stage('Feature Branch') {
            when { not { branch 'main' } }
            steps {
                sh 'npm test'
                sh 'npm run lint'
            }
        }
        
        stage('Main Branch') {
            when { branch 'main' }
            steps {
                sh 'npm test'
                sh 'npm run build'
                sh 'docker build -t myapp:latest .'
                sh 'docker push myapp:latest'
            }
        }
    }
}
```

### Pull Request 빌드
```groovy
pipeline {
    agent any
    stages {
        stage('PR Check') {
            when { changeRequest() }
            steps {
                sh 'npm install'
                sh 'npm test'
                sh 'npm run lint'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'test-results.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
    }
}
```

## 플러그인 활용

### 필수 플러그인
- **Git Plugin**: Git 저장소 연동
- **Pipeline Plugin**: Pipeline 기능
- **Docker Plugin**: Docker 빌드 및 배포
- **Slack Plugin**: Slack 알림
- **Blue Ocean**: 현대적인 UI

### 플러그인 설정 예시
```groovy
// Slack 알림
slackSend(
    channel: '#ci-cd',
    color: 'good',
    message: "Build ${env.BUILD_NUMBER} completed successfully"
)

// 이메일 알림
emailext(
    subject: "Build ${env.BUILD_NUMBER} - ${currentBuild.result}",
    body: "Build details: ${env.BUILD_URL}",
    to: "${env.CHANGE_AUTHOR_EMAIL}"
)
```

## 보안 및 권한 관리

### Credentials 관리
```groovy
pipeline {
    agent any
    environment {
        // Credentials 사용
        DB_PASSWORD = credentials('database-password')
        AWS_ACCESS_KEY = credentials('aws-access-key')
    }
    stages {
        stage('Deploy') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'server-credentials',
                        usernameVariable: 'USERNAME',
                        passwordVariable: 'PASSWORD'
                    )
                ]) {
                    sh 'scp -o StrictHostKeyChecking=no app.jar $USERNAME@server:/opt/'
                }
            }
        }
    }
}
```

### 역할 기반 접근 제어
- **Admin**: 모든 권한
- **Developer**: 빌드 실행, 로그 조회
- **Viewer**: 읽기 전용

## 성능 최적화

### 병렬 실행
```groovy
pipeline {
    agent any
    stages {
        stage('Parallel Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit'
                    }
                }
                stage('Integration Tests') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
            }
        }
    }
}
```

### 캐싱 활용
```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                // Docker 레이어 캐싱
                sh 'docker build --cache-from myapp:latest -t myapp:${BUILD_NUMBER} .'
                
                // npm 캐시 활용
                sh 'npm ci --cache /tmp/npm-cache'
            }
        }
    }
}
```

## 모니터링 및 알림

### 빌드 상태 모니터링
```groovy
pipeline {
    agent any
    stages {
        stage('Health Check') {
            steps {
                script {
                    def response = httpRequest 'http://myapp.com/health'
                    if (response.status != 200) {
                        error("Health check failed: ${response.status}")
                    }
                }
            }
        }
    }
}
```

### 메트릭 수집
- **빌드 시간**: 각 스테이지별 소요 시간
- **성공률**: 빌드 성공/실패 비율
- **배포 빈도**: 일/주/월별 배포 횟수

## 실무 시나리오

### 1. 마이크로서비스 CI/CD
```groovy
pipeline {
    agent any
    stages {
        stage('Build Services') {
            parallel {
                stage('User Service') {
                    steps {
                        dir('user-service') {
                            sh 'mvn clean package'
                            sh 'docker build -t user-service:${BUILD_NUMBER} .'
                        }
                    }
                }
                stage('Order Service') {
                    steps {
                        dir('order-service') {
                            sh 'mvn clean package'
                            sh 'docker build -t order-service:${BUILD_NUMBER} .'
                        }
                    }
                }
            }
        }
    }
}
```

### 2. 데이터베이스 마이그레이션
```groovy
stage('Database Migration') {
    steps {
        sh '''
            flyway -url=jdbc:mysql://db:3306/myapp \
                   -user=admin \
                   -password=${DB_PASSWORD} \
                   migrate
        '''
    }
}
```

### 3. 롤백 전략
```groovy
stage('Deploy with Rollback') {
    steps {
        script {
            try {
                sh 'kubectl apply -f k8s-deployment.yaml'
                sh 'kubectl rollout status deployment/myapp'
            } catch (Exception e) {
                sh 'kubectl rollout undo deployment/myapp'
                throw e
            }
        }
    }
}
```

## 신입 면접 핵심 포인트

### 1. CI/CD의 필요성
- **품질 향상**: 자동화된 테스트로 버그 조기 발견
- **배포 위험 감소**: 작은 단위의 잦은 배포
- **개발 생산성**: 수동 작업 제거

### 2. Pipeline 설계 원칙
- **빠른 피드백**: 실패 시 빠른 알림
- **단계별 검증**: 각 단계에서 품질 검증
- **롤백 가능**: 문제 발생 시 이전 버전으로 복구

### 3. 실무 질문 대비
- "CI/CD 파이프라인에서 테스트가 실패하면 어떻게 처리하나요?"
- "배포 후 문제가 발생했을 때 롤백 전략은?"
- "여러 환경(개발, 스테이징, 프로덕션)에 배포할 때 어떻게 관리하나요?"

### 4. 모범 사례
- **Infrastructure as Code**: 인프라도 코드로 관리
- **보안**: 민감한 정보는 별도 관리
- **모니터링**: 배포 후 상태 확인
- **문서화**: 파이프라인 동작 방식 문서화
