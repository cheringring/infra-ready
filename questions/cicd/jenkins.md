---
question: "Jenkins란 무엇이며 주요 기능은?"
shortAnswer: "Jenkins는 오픈소스 CI/CD 자동화 서버입니다. 빌드, 테스트, 배포를 자동화하며, 플러그인 생태계가 풍부하고, Pipeline as Code를 지원합니다. 다양한 VCS, 빌드 도구, 배포 플랫폼과 통합 가능합니다."
---

## Jenkins 완벽 가이드

### Jenkins란?

오픈소스 자동화 서버로 소프트웨어 개발의 빌드, 테스트, 배포를 자동화합니다.

### 주요 특징

- **오픈소스**: 무료, 활발한 커뮤니티
- **플러그인**: 1,800개 이상
- **분산 빌드**: 여러 노드에서 병렬 실행
- **Pipeline as Code**: Jenkinsfile로 관리
- **다양한 통합**: Git, Docker, Kubernetes 등

### 핵심 개념

#### Job/Project
- 빌드 작업 단위
- Freestyle, Pipeline, Multibranch 등

#### Build
- Job의 실행 인스턴스
- 빌드 번호로 식별

#### Node/Agent
- 빌드를 실행하는 머신
- Master: 중앙 서버
- Agent: 작업 실행 노드

#### Pipeline
- 코드로 정의된 CI/CD 프로세스
- Declarative 또는 Scripted

### Jenkinsfile 예시

#### Declarative Pipeline
```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Deploy') {
            steps {
                sh './deploy.sh'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```
