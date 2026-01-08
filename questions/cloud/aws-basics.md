---
question: "AWS의 주요 서비스들(EC2, S3, RDS, VPC)의 특징과 용도를 설명하고, 신입 엔지니어가 알아야 할 기본 개념을 설명해주세요."
shortAnswer: "EC2는 가상 서버, S3는 객체 스토리지, RDS는 관리형 데이터베이스, VPC는 가상 네트워크 서비스입니다. 각각 확장성, 가용성, 보안을 제공하며 종량제 과금 방식을 사용합니다."
---

# AWS 주요 서비스 개요

## EC2 (Elastic Compute Cloud)

### 기본 개념
- **정의**: 클라우드에서 제공하는 가상 서버
- **특징**: 필요에 따라 컴퓨팅 용량을 확장/축소 가능
- **과금**: 사용한 시간만큼 과금 (초 단위)

### 인스턴스 타입
```
t3.micro    - 1 vCPU, 1GB RAM (프리티어)
t3.small    - 1 vCPU, 2GB RAM
m5.large    - 2 vCPU, 8GB RAM (범용)
c5.xlarge   - 4 vCPU, 8GB RAM (컴퓨팅 최적화)
r5.large    - 2 vCPU, 16GB RAM (메모리 최적화)
```

### 주요 기능
- **Auto Scaling**: 트래픽에 따른 자동 확장/축소
- **Load Balancer**: 트래픽 분산
- **Security Groups**: 방화벽 역할
- **Key Pairs**: SSH 접속을 위한 키 관리

### 실무 사용 예시
```bash
# EC2 인스턴스 접속
ssh -i mykey.pem ec2-user@ec2-xx-xx-xx-xx.compute-1.amazonaws.com

# 인스턴스 상태 확인
aws ec2 describe-instances --instance-ids i-1234567890abcdef0
```

## S3 (Simple Storage Service)

### 기본 개념
- **정의**: 객체 스토리지 서비스
- **특징**: 무제한 용량, 99.999999999% 내구성
- **구조**: 버킷(Bucket) > 객체(Object)

### 스토리지 클래스
- **Standard**: 자주 접근하는 데이터
- **IA (Infrequent Access)**: 가끔 접근하는 데이터
- **Glacier**: 아카이브용 (검색 시간 분~시간)
- **Deep Archive**: 장기 보관용 (검색 시간 12시간)

### 주요 기능
- **버전 관리**: 파일 버전 히스토리 관리
- **정적 웹 호스팅**: HTML, CSS, JS 파일 호스팅
- **CORS 설정**: 크로스 도메인 접근 허용
- **액세스 로그**: 접근 기록 저장

### 실무 사용 예시
```bash
# 파일 업로드
aws s3 cp file.txt s3://my-bucket/

# 버킷 동기화
aws s3 sync ./local-folder s3://my-bucket/folder/

# 퍼블릭 읽기 권한 설정
aws s3api put-object-acl --bucket my-bucket --key file.txt --acl public-read
```

## RDS (Relational Database Service)

### 기본 개념
- **정의**: 관리형 관계형 데이터베이스 서비스
- **지원 엔진**: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server
- **특징**: 백업, 패치, 모니터링 자동화

### 주요 기능
- **Multi-AZ**: 고가용성을 위한 다중 가용영역 배포
- **Read Replica**: 읽기 성능 향상을 위한 복제본
- **자동 백업**: 지정된 시간에 자동 백업
- **Parameter Groups**: 데이터베이스 설정 관리

### 인스턴스 클래스
```
db.t3.micro     - 1 vCPU, 1GB RAM (프리티어)
db.t3.small     - 1 vCPU, 2GB RAM
db.m5.large     - 2 vCPU, 8GB RAM
db.r5.xlarge    - 4 vCPU, 32GB RAM (메모리 최적화)
```

### 실무 설정 예시
```sql
-- RDS MySQL 연결
mysql -h mydb.cluster-xyz.us-east-1.rds.amazonaws.com -u admin -p

-- 성능 모니터링
SHOW PROCESSLIST;
SHOW ENGINE INNODB STATUS;
```

## VPC (Virtual Private Cloud)

### 기본 개념
- **정의**: AWS 클라우드 내 가상 네트워크
- **특징**: 완전히 격리된 네트워크 환경
- **CIDR**: IP 주소 범위 설정 (예: 10.0.0.0/16)

### 주요 구성 요소
- **서브넷**: VPC 내 IP 주소 범위 분할
- **인터넷 게이트웨이**: 인터넷 연결
- **NAT 게이트웨이**: 프라이빗 서브넷의 아웃바운드 인터넷 접근
- **라우팅 테이블**: 트래픽 라우팅 규칙

### 네트워크 구성 예시
```
VPC: 10.0.0.0/16
├── 퍼블릭 서브넷: 10.0.1.0/24 (웹 서버)
├── 프라이빗 서브넷: 10.0.2.0/24 (애플리케이션 서버)
└── 프라이빗 서브넷: 10.0.3.0/24 (데이터베이스)
```

### 보안 그룹 vs NACL
**보안 그룹 (Security Groups)**:
- 인스턴스 레벨 방화벽
- Stateful (응답 트래픽 자동 허용)
- 허용 규칙만 설정 가능

**네트워크 ACL (NACL)**:
- 서브넷 레벨 방화벽
- Stateless (응답 트래픽도 명시적 허용 필요)
- 허용/거부 규칙 모두 설정 가능

## AWS 기본 개념

### 리전과 가용영역
- **리전 (Region)**: 지리적으로 분리된 데이터센터 집합
- **가용영역 (AZ)**: 리전 내 물리적으로 분리된 데이터센터
- **엣지 로케이션**: CDN을 위한 캐시 서버 위치

### IAM (Identity and Access Management)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

### 태그 관리
```bash
# 리소스 태그 설정
aws ec2 create-tags --resources i-1234567890abcdef0 --tags Key=Environment,Value=Production
```

## 비용 최적화

### 프리티어 활용
- **EC2**: t2.micro 인스턴스 월 750시간
- **S3**: 5GB 스토리지, 20,000 GET 요청
- **RDS**: db.t2.micro 월 750시간

### 비용 절약 방법
1. **예약 인스턴스**: 1-3년 약정으로 최대 75% 할인
2. **스팟 인스턴스**: 경매 방식으로 최대 90% 할인
3. **Auto Scaling**: 필요한 만큼만 리소스 사용
4. **S3 Lifecycle**: 오래된 데이터를 저렴한 스토리지로 이동

## 신입 면접 핵심 포인트

### 1. 클라우드 vs 온프레미스
- **확장성**: 필요에 따른 즉시 확장
- **비용**: 초기 투자 없이 사용량만큼 과금
- **관리**: 인프라 관리 부담 감소

### 2. 고가용성 설계
- **Multi-AZ 배포**: 장애 시 자동 페일오버
- **Load Balancer**: 트래픽 분산으로 단일 장애점 제거
- **Auto Scaling**: 트래픽 증가 시 자동 확장

### 3. 보안 모범 사례
- **최소 권한 원칙**: 필요한 최소한의 권한만 부여
- **MFA 활성화**: 다단계 인증으로 보안 강화
- **정기적인 액세스 검토**: 불필요한 권한 제거

### 4. 실무 질문 대비
- "EC2 인스턴스가 응답하지 않을 때 어떻게 해결하나요?"
- "S3에 업로드한 파일이 접근되지 않을 때 확인할 점은?"
- "RDS 성능이 느릴 때 어떤 방법으로 개선할 수 있나요?"
