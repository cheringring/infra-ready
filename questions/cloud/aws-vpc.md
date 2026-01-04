---
question: "AWS VPC란 무엇이며 주요 구성 요소는?"
shortAnswer: "VPC(Virtual Private Cloud)는 AWS 클라우드에서 논리적으로 격리된 가상 네트워크입니다. 주요 구성 요소로는 서브넷, 라우팅 테이블, 인터넷 게이트웨이, NAT 게이트웨이, 보안 그룹, NACL 등이 있습니다."
---

## AWS VPC 완벽 가이드

### VPC란?

Virtual Private Cloud는 사용자가 정의한 가상 네트워크 환경으로, AWS 리소스를 격리된 네트워크에서 실행할 수 있습니다.

### 주요 구성 요소

#### 1. 서브넷 (Subnet)
VPC의 IP 주소 범위를 나눈 것

**퍼블릭 서브넷**
- 인터넷 게이트웨이로 라우팅
- 공인 IP 할당 가능
- 웹 서버, 로드 밸런서 배치

**프라이빗 서브넷**
- 인터넷 직접 접근 불가
- NAT 게이트웨이를 통한 아웃바운드만 가능
- 데이터베이스, 애플리케이션 서버 배치

#### 2. 라우팅 테이블 (Route Table)
네트워크 트래픽의 경로를 결정

```
Destination         Target
10.0.0.0/16        local
0.0.0.0/0          igw-xxxxx
```

#### 3. 인터넷 게이트웨이 (IGW)
VPC와 인터넷 간 통신 가능

#### 4. NAT 게이트웨이
프라이빗 서브넷의 인스턴스가 인터넷에 접근

**NAT Gateway vs NAT Instance**
- NAT Gateway: 관리형, 고가용성, 비쌈
- NAT Instance: EC2 인스턴스, 직접 관리, 저렴

#### 5. 보안 그룹 (Security Group)
인스턴스 수준의 가상 방화벽

**특징**
- Stateful (상태 저장)
- 허용 규칙만 가능
- 인스턴스 수준

**예시**
```
Type        Protocol  Port    Source
SSH         TCP       22      0.0.0.0/0
HTTP        TCP       80      0.0.0.0/0
HTTPS       TCP       443     0.0.0.0/0
```

#### 6. NACL (Network ACL)
서브넷 수준의 방화벽

**특징**
- Stateless (상태 비저장)
- 허용/거부 규칙 모두 가능
- 서브넷 수준
- 규칙 번호 순서대로 평가

### VPC 설계 베스트 프랙티스

#### CIDR 블록 선택
```
VPC:           10.0.0.0/16
Public 1:      10.0.1.0/24
Public 2:      10.0.2.0/24
Private 1:     10.0.11.0/24
Private 2:     10.0.12.0/24
```

#### 다중 AZ 배포
- 고가용성 확보
- 각 AZ에 퍼블릭/프라이빗 서브넷 배치
- 로드 밸런서로 트래픽 분산

#### 계층 분리
- **퍼블릭 계층**: 로드 밸런서, Bastion Host
- **애플리케이션 계층**: 웹/앱 서버
- **데이터 계층**: 데이터베이스, 캐시

### VPC 피어링

서로 다른 VPC 간 프라이빗 통신

**특징**
- 같은 리전 또는 다른 리전
- 같은 계정 또는 다른 계정
- CIDR 블록 중복 불가
- 전이적 피어링 불가

### VPC 엔드포인트

AWS 서비스에 프라이빗하게 접근

**Gateway Endpoint**
- S3, DynamoDB
- 무료
- 라우팅 테이블 수정

**Interface Endpoint**
- 대부분의 AWS 서비스
- ENI 생성
- 시간당 요금

### VPN 연결

온프레미스와 VPC 연결

**Site-to-Site VPN**
- IPsec VPN 터널
- Virtual Private Gateway 필요
- 인터넷을 통한 암호화 연결

**Client VPN**
- 개별 사용자 VPN 접속
- OpenVPN 기반

### Direct Connect

전용 네트워크 연결

**특징**
- 높은 대역폭 (1Gbps ~ 100Gbps)
- 안정적인 성능
- 낮은 지연 시간
- 비용 절감 (대용량 전송 시)

### 보안 베스트 프랙티스

1. **최소 권한 원칙**
   - 필요한 포트만 개방
   - 소스 IP 제한

2. **계층별 보안**
   - 보안 그룹 + NACL 조합
   - 심층 방어

3. **프라이빗 서브넷 활용**
   - 중요 리소스는 프라이빗 배치
   - Bastion Host를 통한 접근

4. **VPC Flow Logs**
   - 네트워크 트래픽 모니터링
   - 보안 분석

5. **암호화**
   - VPN/Direct Connect 사용
   - TLS/SSL 적용

### 실무 시나리오

#### 3-Tier 아키텍처
```
Internet
    ↓
Internet Gateway
    ↓
Public Subnet (ELB)
    ↓
Private Subnet (App Servers)
    ↓
Private Subnet (RDS)
```

#### 하이브리드 클라우드
```
On-Premise
    ↓
Direct Connect / VPN
    ↓
VPC
    ↓
AWS Services
```

### 비용 최적화

1. **NAT Gateway 최적화**
   - 단일 NAT Gateway 공유
   - NAT Instance 고려 (소규모)

2. **VPC Endpoint 활용**
   - S3, DynamoDB는 Gateway Endpoint
   - 데이터 전송 비용 절감

3. **Direct Connect**
   - 대용량 데이터 전송 시 고려
