---
question: "AWS EC2란 무엇이며 주요 특징은 무엇인가요?"
shortAnswer: "EC2(Elastic Compute Cloud)는 AWS의 가상 서버 서비스입니다. 필요에 따라 컴퓨팅 용량을 조절할 수 있으며, 다양한 인스턴스 타입, 온디맨드/예약/스팟 인스턴스 등의 요금 옵션, Auto Scaling, ELB 연동 등의 특징이 있습니다."
---

## AWS EC2 상세 가이드

### EC2란?

Amazon Elastic Compute Cloud(EC2)는 AWS 클라우드에서 확장 가능한 컴퓨팅 용량을 제공하는 서비스입니다.

### 주요 특징

#### 1. 탄력성 (Elasticity)
- 필요에 따라 인스턴스 수를 늘리거나 줄일 수 있음
- Auto Scaling을 통한 자동 확장/축소
- 수 분 내에 새로운 서버 인스턴스 생성 가능

#### 2. 다양한 인스턴스 타입
- **범용 (General Purpose)**: T3, M5 - 균형잡힌 성능
- **컴퓨팅 최적화 (Compute Optimized)**: C5 - CPU 집약적 작업
- **메모리 최적화 (Memory Optimized)**: R5, X1 - 대용량 메모리
- **스토리지 최적화 (Storage Optimized)**: I3, D2 - 높은 I/O
- **GPU 인스턴스**: P3, G4 - 머신러닝, 그래픽 작업

#### 3. 요금 옵션

**온디맨드 (On-Demand)**
- 사용한 만큼 지불
- 약정 없음
- 테스트, 개발 환경에 적합

**예약 인스턴스 (Reserved Instances)**
- 1년 또는 3년 약정
- 최대 75% 할인
- 안정적인 워크로드에 적합

**스팟 인스턴스 (Spot Instances)**
- 최대 90% 할인
- AWS의 여유 용량 사용
- 중단 가능한 워크로드에 적합

**Savings Plans**
- 유연한 요금 모델
- 인스턴스 패밀리, 리전 변경 가능

### 주요 구성 요소

#### AMI (Amazon Machine Image)
- 인스턴스 시작에 필요한 템플릿
- OS, 애플리케이션, 설정 포함
- 커스텀 AMI 생성 가능

#### 보안 그룹 (Security Group)
- 가상 방화벽
- 인바운드/아웃바운드 트래픽 제어
- 상태 저장 (Stateful)

#### EBS (Elastic Block Store)
- 영구 블록 스토리지
- 스냅샷을 통한 백업
- 다양한 볼륨 타입 (gp3, io2, st1 등)

#### Elastic IP
- 고정 공인 IP 주소
- 인스턴스 간 이동 가능

### 네트워킹

#### VPC (Virtual Private Cloud)
- 논리적으로 격리된 네트워크
- 서브넷, 라우팅 테이블 구성
- 퍼블릭/프라이빗 서브넷 분리

#### ELB (Elastic Load Balancer)
- Application Load Balancer (ALB): HTTP/HTTPS
- Network Load Balancer (NLB): TCP/UDP
- Gateway Load Balancer (GWLB): 방화벽, IDS/IPS

### Auto Scaling

#### 특징
- 자동으로 EC2 인스턴스 수 조정
- 고가용성 보장
- 비용 최적화

#### 구성 요소
- Launch Template/Configuration
- Auto Scaling Group
- Scaling Policy (CPU, 메모리, 커스텀 메트릭 기반)

### 모니터링

#### CloudWatch
- CPU, 네트워크, 디스크 메트릭
- 커스텀 메트릭 설정 가능
- 알람 설정

#### CloudWatch Logs
- 애플리케이션 로그 수집
- 로그 분석 및 검색

### 실무 베스트 프랙티스

1. **보안**
   - 최소 권한 원칙 적용
   - 보안 그룹 규칙 최소화
   - IAM 역할 사용

2. **고가용성**
   - 다중 AZ 배포
   - Auto Scaling 활용
   - ELB 사용

3. **비용 최적화**
   - 적절한 인스턴스 타입 선택
   - 예약 인스턴스/Savings Plans 활용
   - 미사용 리소스 정리

4. **백업**
   - EBS 스냅샷 정기 생성
   - AMI 백업
   - 다른 리전에 복제

5. **모니터링**
   - CloudWatch 알람 설정
   - 로그 중앙 집중화
   - 정기적인 성능 검토
