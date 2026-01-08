---
question: "포인트아이 인프라 엔지니어 예상 질문"
shortAnswer: "포인트아이는 클라우드 보안 전문 기업으로, AWS/Azure/GCP 멀티 클라우드 환경, CSPM(Cloud Security Posture Management), 컨테이너 보안, 컴플라이언스, DevSecOps 경험을 중요하게 봅니다."
---

## 포인트아이 인프라 엔지니어 면접 예상 질문

### 1. 클라우드 보안 기초

#### Q1: "클라우드 보안과 온프레미스 보안의 차이점은 무엇인가요?"

**답변 포인트**:
```
1. 책임 분담 모델 (Shared Responsibility Model)
   
   클라우드 제공자 책임:
   - 물리적 보안 (데이터센터)
   - 네트워크 인프라
   - 하이퍼바이저
   - 하드웨어
   
   고객 책임:
   - 데이터 암호화
   - IAM (접근 제어)
   - 네트워크 설정 (보안 그룹, NACL)
   - 애플리케이션 보안
   - OS 패치

2. 주요 차이점
   - 동적 환경: 리소스가 자주 생성/삭제
   - API 기반: 모든 작업이 API로 수행
   - 멀티 테넌시: 여러 고객이 인프라 공유
   - 가시성 부족: 물리적 접근 불가
```

#### Q2: "CSPM(Cloud Security Posture Management)이 무엇이고 왜 필요한가요?"

**답변 포인트**:
```
CSPM 정의:
- 클라우드 환경의 보안 설정 오류를 자동으로 탐지하고 수정
- 컴플라이언스 준수 여부 모니터링
- 보안 위험 가시화

주요 기능:
1. 설정 오류 탐지
   - 공개된 S3 버킷
   - 과도한 IAM 권한
   - 암호화되지 않은 데이터베이스
   - 보안 그룹 규칙 오류

2. 컴플라이언스 체크
   - ISMS-P
   - ISO 27001
   - PCI-DSS
   - GDPR

3. 위협 탐지
   - 비정상 API 호출
   - 권한 상승 시도
   - 의심스러운 네트워크 활동

4. 자동 수정
   - 정책 위반 시 자동 차단
   - 알림 및 티켓 생성
```

**포인트아이 제품 관련**:
```
포인트아이의 CSPM 솔루션:
- 멀티 클라우드 지원 (AWS, Azure, GCP, NCP)
- 실시간 모니터링
- 자동 컴플라이언스 체크
- 대시보드 및 리포팅
```

### 2. AWS 보안

#### Q3: "AWS에서 가장 흔한 보안 설정 오류는 무엇인가요?"

**답변 포인트**:
```
1. S3 버킷 공개 노출
   문제: 민감한 데이터가 인터넷에 공개
   해결:
   - Block Public Access 활성화
   - Bucket Policy 검토
   - 암호화 활성화 (SSE-S3, SSE-KMS)

2. 과도한 IAM 권한
   문제: 최소 권한 원칙 위반
   해결:
   - IAM Access Analyzer 사용
   - 정기적인 권한 검토
   - 임시 자격 증명 사용 (STS)

3. 보안 그룹 오픈
   문제: 0.0.0.0/0으로 모든 포트 오픈
   해결:
   - 필요한 IP만 허용
   - 최소 포트만 오픈
   - VPC Flow Logs로 모니터링

4. 암호화 미사용
   문제: 데이터 평문 저장
   해결:
   - EBS 볼륨 암호화
   - RDS 암호화
   - S3 기본 암호화

5. CloudTrail 비활성화
   문제: 감사 로그 없음
   해결:
   - CloudTrail 활성화
   - S3에 로그 저장
   - CloudWatch Logs 연동
```

#### Q4: "AWS IAM 정책을 설계할 때 고려사항은?"

**답변 포인트**:
```json
// 나쁜 예: 너무 광범위한 권한
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "*",
    "Resource": "*"
  }]
}

// 좋은 예: 최소 권한 원칙
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::my-bucket",
      "Condition": {
        "StringLike": {
          "s3:prefix": "uploads/*"
        }
      }
    }
  ]
}
```

**설계 원칙**:
```
1. 최소 권한 (Least Privilege)
   - 필요한 권한만 부여
   - 정기적으로 검토

2. 역할 기반 접근 제어 (RBAC)
   - 사용자 대신 역할 사용
   - EC2 인스턴스에 IAM Role 연결

3. 조건 사용
   - IP 제한
   - MFA 강제
   - 시간 제한

4. 정책 검증
   - IAM Policy Simulator
   - Access Analyzer
```

### 3. 컨테이너 보안

#### Q5: "컨테이너 환경에서 보안 위협과 대응 방안은?"

**답변 포인트**:
```
1. 이미지 취약점
   위협: 오래된 베이스 이미지, 취약한 패키지
   대응:
   - Trivy, Clair로 이미지 스캔
   - 최소 베이스 이미지 사용 (Alpine, Distroless)
   - 정기적인 이미지 업데이트

2. 권한 상승
   위협: root로 컨테이너 실행
   대응:
   - Non-root 사용자로 실행
   - Security Context 설정
   - Pod Security Policy/Standards

3. 시크릿 노출
   위협: 환경 변수에 비밀번호 저장
   대응:
   - Kubernetes Secrets
   - HashiCorp Vault
   - AWS Secrets Manager

4. 네트워크 공격
   위협: 컨테이너 간 무제한 통신
   대응:
   - Network Policy
   - Service Mesh (Istio)
   - mTLS
```

**Kubernetes 보안 설정 예시**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: myapp:1.0
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    resources:
      limits:
        memory: "512Mi"
        cpu: "500m"
      requests:
        memory: "256Mi"
        cpu: "250m"
```

#### Q6: "컨테이너 이미지 스캔을 어떻게 CI/CD에 통합하나요?"

**답변 포인트**:
```yaml
# GitLab CI/CD 예시
stages:
  - build
  - scan
  - deploy

build:
  stage: build
  script:
    - docker build -t myapp:$CI_COMMIT_SHA .

scan:
  stage: scan
  script:
    - trivy image --severity HIGH,CRITICAL myapp:$CI_COMMIT_SHA
    - |
      if [ $? -ne 0 ]; then
        echo "Critical vulnerabilities found!"
        exit 1
      fi

deploy:
  stage: deploy
  script:
    - kubectl set image deployment/myapp myapp=myapp:$CI_COMMIT_SHA
  only:
    - main
```

### 4. 컴플라이언스

#### Q7: "ISMS-P 인증을 위해 클라우드 인프라에서 준비해야 할 것은?"

**답변 포인트**:
```
1. 접근 통제
   - IAM 정책 관리
   - MFA 강제
   - 최소 권한 원칙
   - 정기적인 권한 검토

2. 암호화
   - 전송 중 암호화 (TLS/SSL)
   - 저장 데이터 암호화 (AES-256)
   - 키 관리 (KMS)

3. 로그 관리
   - CloudTrail (AWS)
   - Activity Log (Azure)
   - Cloud Audit Logs (GCP)
   - 로그 보관 기간 (최소 1년)

4. 백업 및 복구
   - 정기적인 백업
   - 복구 테스트
   - RTO/RPO 정의

5. 네트워크 보안
   - VPC 격리
   - 보안 그룹 설정
   - 침입 탐지 시스템

6. 취약점 관리
   - 정기적인 보안 스캔
   - 패치 관리
   - 취약점 대응 절차

7. 모니터링
   - 실시간 모니터링
   - 이상 탐지
   - 알림 설정
```

#### Q8: "클라우드 환경에서 개인정보 보호는 어떻게 하나요?"

**답변 포인트**:
```
1. 데이터 분류
   - 개인정보 식별
   - 민감도 등급 분류
   - 태그 관리

2. 암호화
   - 필드 레벨 암호화
   - 데이터베이스 암호화
   - 백업 암호화

3. 접근 제어
   - 역할 기반 접근
   - 데이터 마스킹
   - 감사 로그

4. 데이터 보관
   - 보관 기간 정책
   - 자동 삭제
   - 안전한 폐기

5. 국내 데이터 보관
   - 리전 선택 (서울)
   - 데이터 주권
```

### 5. DevSecOps

#### Q9: "DevSecOps를 구현하려면 어떻게 해야 하나요?"

**답변 포인트**:
```
DevSecOps 파이프라인:

1. 코드 단계
   - SAST (Static Application Security Testing)
   - 코드 리뷰
   - 시크릿 스캔 (git-secrets, truffleHog)

2. 빌드 단계
   - 의존성 스캔 (OWASP Dependency-Check)
   - 컨테이너 이미지 스캔 (Trivy)
   - 라이선스 체크

3. 테스트 단계
   - DAST (Dynamic Application Security Testing)
   - 침투 테스트
   - API 보안 테스트

4. 배포 단계
   - 인프라 보안 스캔 (Checkov, tfsec)
   - 설정 검증
   - 컴플라이언스 체크

5. 운영 단계
   - 런타임 보안 (Falco)
   - 로그 모니터링
   - 위협 탐지
```

**도구 예시**:
```yaml
# GitHub Actions 예시
name: DevSecOps Pipeline

on: [push]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      # 시크릿 스캔
      - name: Secret Scan
        uses: trufflesecurity/trufflehog@main
      
      # SAST
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
      
      # 의존성 스캔
      - name: Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
      
      # 컨테이너 스캔
      - name: Build Image
        run: docker build -t myapp:latest .
      
      - name: Trivy Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:latest
          severity: CRITICAL,HIGH
      
      # IaC 스캔
      - name: Terraform Security Scan
        uses: aquasecurity/tfsec-action@v1.0.0
```

### 6. 멀티 클라우드

#### Q10: "멀티 클라우드 환경에서 보안 관리의 어려움은?"

**답변 포인트**:
```
1. 일관성 부족
   문제: 각 클라우드마다 다른 보안 서비스
   해결: 통합 CSPM 솔루션 (포인트아이)

2. 가시성 부족
   문제: 여러 콘솔 관리
   해결: 중앙 집중식 대시보드

3. 정책 관리
   문제: 각 클라우드마다 다른 정책 형식
   해결: IaC로 표준화 (Terraform)

4. 컴플라이언스
   문제: 각 클라우드마다 다른 인증
   해결: 통합 컴플라이언스 체크

5. 비용 관리
   문제: 여러 클라우드 비용 추적
   해결: FinOps 도구
```

**Terraform으로 멀티 클라우드 보안 설정**:
```hcl
# AWS
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

# Azure
resource "azurerm_storage_account" "data" {
  name                     = "mydatasa"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  
  enable_https_traffic_only = true
  min_tls_version          = "TLS1_2"
}

# GCP
resource "google_storage_bucket" "data" {
  name     = "my-data-bucket"
  location = "ASIA-NORTHEAST3"
  
  encryption {
    default_kms_key_name = google_kms_crypto_key.key.id
  }
}
```

### 7. 실무 시나리오

#### Q11: "프로덕션 환경에서 보안 사고가 발생했습니다. 어떻게 대응하시겠습니까?"

**답변 포인트**:
```
사고 대응 프로세스:

1. 탐지 및 분석 (Detection & Analysis)
   - 알림 확인 (CloudWatch, GuardDuty)
   - 로그 분석 (CloudTrail, VPC Flow Logs)
   - 영향 범위 파악

2. 격리 (Containment)
   - 의심 리소스 격리
   - 보안 그룹 수정
   - IAM 권한 취소
   - 네트워크 차단

3. 제거 (Eradication)
   - 악성 코드 제거
   - 취약점 패치
   - 침해된 자격 증명 교체

4. 복구 (Recovery)
   - 백업에서 복원
   - 서비스 재시작
   - 모니터링 강화

5. 사후 분석 (Post-Incident)
   - 근본 원인 분석
   - 재발 방지 대책
   - 문서화
```

**예시 시나리오**:
```
상황: AWS GuardDuty에서 "UnauthorizedAccess:EC2/SSHBruteForce" 알림

대응:
1. 해당 EC2 인스턴스 보안 그룹에서 SSH 포트 차단
2. CloudTrail 로그로 공격 IP 확인
3. NACL에 공격 IP 차단 규칙 추가
4. SSH 키 교체
5. Fail2ban 설치
6. SSH 포트 변경 (22 → 다른 포트)
7. VPN 또는 Bastion Host 사용으로 전환
```

### 8. 포인트아이 제품 관련

#### Q12: "포인트아이의 CSPM 솔루션을 고객에게 어떻게 설명하시겠습니까?"

**답변 포인트**:
```
포인트아이 CSPM 가치 제안:

1. 멀티 클라우드 지원
   - AWS, Azure, GCP, NCP 통합 관리
   - 단일 대시보드에서 모든 클라우드 가시화

2. 자동화된 보안 점검
   - 1,000개 이상의 보안 규칙
   - 실시간 설정 오류 탐지
   - 자동 수정 기능

3. 컴플라이언스 관리
   - ISMS-P, ISO 27001, PCI-DSS
   - 자동 리포트 생성
   - 증거 자료 수집

4. 비용 절감
   - 보안 사고 예방
   - 수동 점검 시간 절약
   - 컴플라이언스 인증 비용 절감

5. 한국 시장 특화
   - 한국어 지원
   - 국내 규제 대응
   - 로컬 지원팀
```

### 9. 최신 보안 트렌드

#### Q13: "Zero Trust 아키텍처에 대해 설명해주세요."

**답변 포인트**:
```
Zero Trust 원칙:
"절대 신뢰하지 말고, 항상 검증하라"

핵심 개념:

1. 신원 확인
   - 모든 사용자/디바이스 인증
   - MFA 필수
   - 지속적인 검증

2. 최소 권한
   - Just-In-Time 접근
   - Just-Enough-Access
   - 정기적인 권한 검토

3. 마이크로 세그멘테이션
   - 네트워크를 작은 단위로 분할
   - 각 세그먼트마다 접근 제어
   - East-West 트래픽 제어

4. 지속적인 모니터링
   - 모든 활동 로깅
   - 이상 행위 탐지
   - 실시간 대응

구현 방법:
- AWS: IAM Identity Center, VPC, Security Groups
- Azure: Azure AD, Conditional Access
- GCP: BeyondCorp, Identity-Aware Proxy
```

### 10. 기술 역량

#### Q14: "Infrastructure as Code로 보안을 어떻게 관리하나요?"

**답변 포인트**:
```hcl
# Terraform으로 보안 설정 코드화

# 보안 그룹 - 최소 권한
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Web server security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from ALB"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow outbound to DB only"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    security_groups = [aws_security_group.db.id]
  }
}

# S3 버킷 - 암호화 및 접근 제어
resource "aws_s3_bucket" "data" {
  bucket = "my-secure-bucket"
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
  }
}

# 보안 스캔
# tfsec로 Terraform 코드 스캔
# checkov로 정책 위반 체크
```

### 면접 준비 팁

1. **포인트아이 제품 이해**
   - CSPM 솔루션 기능
   - 경쟁사 대비 차별점
   - 고객 사례

2. **클라우드 보안 자격증**
   - AWS Certified Security - Specialty
   - Azure Security Engineer Associate
   - CCSP (Certified Cloud Security Professional)

3. **실무 경험 강조**
   - 보안 사고 대응 경험
   - 컴플라이언스 인증 경험
   - 멀티 클라우드 관리 경험

4. **보안 도구 경험**
   - CSPM: Prisma Cloud, Wiz, Orca
   - SAST/DAST: SonarQube, Checkmarx
   - 컨테이너 스캔: Trivy, Aqua

5. **최신 보안 트렌드**
   - Zero Trust
   - SASE (Secure Access Service Edge)
   - CNAPP (Cloud-Native Application Protection Platform)
   - Supply Chain Security
