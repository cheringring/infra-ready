---
question: "OSPF 동적 라우팅 프로토콜의 동작 원리와 Area 개념, 그리고 대규모 네트워크에서 최적 경로 선택 과정을 설명해주세요."
shortAnswer: "OSPF는 링크 상태 라우팅 프로토콜로 LSA를 통해 네트워크 토폴로지를 학습하고 SPF 알고리즘으로 최단 경로를 계산합니다. Area로 네트워크를 계층화하여 확장성을 제공하며, Cost 값으로 최적 경로를 결정합니다."
---

# OSPF (Open Shortest Path First) 라우팅 프로토콜

## OSPF 기본 개념

### OSPF란?
- **정의**: 링크 상태(Link State) 기반 동적 라우팅 프로토콜
- **표준**: RFC 2328 (OSPFv2), RFC 5340 (OSPFv3)
- **특징**: 계층적 구조, 빠른 수렴, 무루프

### OSPF vs 다른 라우팅 프로토콜
```
Distance Vector (RIP):
- 홉 카운트 기반
- 느린 수렴
- 루프 가능성

Link State (OSPF):
- 대역폭 기반 Cost
- 빠른 수렴
- 루프 방지 (SPF 알고리즘)

Path Vector (BGP):
- AS Path 기반
- 인터넷 라우팅
- 정책 기반 라우팅
```

## OSPF 동작 원리

### 1. Neighbor Discovery
```bash
# OSPF Hello 패킷 교환
Router1 ----Hello----> Router2
Router1 <---Hello----- Router2

# Hello 패킷 내용:
- Router ID
- Area ID
- Hello/Dead Interval
- Network Mask
- Designated Router
```

### 2. Database Synchronization
```bash
# LSA (Link State Advertisement) 교환 과정
1. DBD (Database Description) 교환
2. LSR (Link State Request) 전송
3. LSU (Link State Update) 응답
4. LSAck (Link State Acknowledgment) 확인
```

### 3. SPF 계산
```
Dijkstra's Algorithm:
1. 자신을 Root로 설정
2. 직접 연결된 링크 비용 계산
3. 최소 비용 경로 선택
4. 모든 목적지까지 반복
```

## OSPF Area 개념

### Area 구조
```
        Area 0 (Backbone)
    ┌─────────┼─────────┐
Area 1      Area 2      Area 3
(Sales)   (Development) (Management)
```

### Area 유형

#### 1. Backbone Area (Area 0)
```bash
# Area 0 설정
Router(config)# router ospf 1
Router(config-router)# network 10.0.0.0 0.0.0.255 area 0
```
- **역할**: 모든 Area 간 통신의 중심
- **필수**: 모든 OSPF 네트워크에 반드시 존재

#### 2. Standard Area
```bash
# Standard Area 설정
Router(config)# router ospf 1
Router(config-router)# network 192.168.1.0 0.0.0.255 area 1
Router(config-router)# network 192.168.2.0 0.0.0.255 area 1
```
- **특징**: 모든 LSA 타입 허용
- **용도**: 일반적인 내부 네트워크

#### 3. Stub Area
```bash
# Stub Area 설정
Router(config)# router ospf 1
Router(config-router)# area 2 stub
Router(config-router)# network 192.168.3.0 0.0.0.255 area 2
```
- **특징**: Type 5 LSA (외부 경로) 차단
- **장점**: 라우팅 테이블 크기 감소

#### 4. Totally Stub Area
```bash
# Totally Stub Area 설정 (ABR에서)
Router(config)# router ospf 1
Router(config-router)# area 3 stub no-summary
```
- **특징**: Type 3, 4, 5 LSA 모두 차단
- **용도**: 매우 제한적인 환경

#### 5. NSSA (Not-So-Stubby Area)
```bash
# NSSA 설정
Router(config)# router ospf 1
Router(config-router)# area 4 nssa
```
- **특징**: Type 7 LSA로 외부 경로 허용
- **용도**: 외부 연결이 필요한 Stub Area

## OSPF 라우터 유형

### 1. Internal Router
- **정의**: 모든 인터페이스가 같은 Area에 속함
- **역할**: Area 내부 라우팅

### 2. ABR (Area Border Router)
```bash
# ABR 설정 예시
Router(config)# router ospf 1
Router(config-router)# network 10.0.0.0 0.0.0.255 area 0
Router(config-router)# network 192.168.1.0 0.0.0.255 area 1
```
- **정의**: 여러 Area에 연결된 라우터
- **역할**: Area 간 라우팅 정보 교환

### 3. ASBR (Autonomous System Boundary Router)
```bash
# ASBR 설정 (외부 경로 재분배)
Router(config)# router ospf 1
Router(config-router)# redistribute static subnets
Router(config-router)# redistribute connected subnets
Router(config-router)# default-information originate
```
- **정의**: 외부 AS와 연결된 라우터
- **역할**: 외부 경로 정보 주입

### 4. Backbone Router
- **정의**: Area 0에 연결된 모든 라우터
- **역할**: Backbone Area 라우팅

## OSPF 네트워크 타입

### 1. Broadcast Network
```bash
# Ethernet 환경에서 기본값
Router(config)# interface gigabitethernet 0/0
Router(config-if)# ip ospf network broadcast
```
- **특징**: DR/BDR 선출
- **Hello Interval**: 10초
- **Dead Interval**: 40초

### 2. Point-to-Point Network
```bash
# 직렬 연결에서 사용
Router(config)# interface serial 0/0
Router(config-if)# ip ospf network point-to-point
```
- **특징**: DR/BDR 불필요
- **Hello Interval**: 10초

### 3. NBMA (Non-Broadcast Multi-Access)
```bash
# Frame Relay 환경
Router(config)# interface serial 0/0
Router(config-if)# ip ospf network non-broadcast
Router(config-if)# ip ospf neighbor 192.168.1.2
```
- **특징**: 수동 neighbor 설정 필요
- **Hello Interval**: 30초

## DR/BDR 선출 과정

### 선출 기준
```
1. OSPF Priority (높을수록 우선)
2. Router ID (높을수록 우선)
3. 가장 높은 IP 주소
```

### DR/BDR 설정
```bash
# Priority 설정 (0-255, 기본값 1)
Router(config)# interface gigabitethernet 0/0
Router(config-if)# ip ospf priority 100

# Priority 0 = DR/BDR 선출에서 제외
Router(config-if)# ip ospf priority 0

# Router ID 수동 설정
Router(config)# router ospf 1
Router(config-router)# router-id 1.1.1.1
```

## OSPF Cost 계산

### Cost 공식
```
Cost = Reference Bandwidth / Interface Bandwidth

기본 Reference Bandwidth = 100 Mbps
- FastEthernet (100M): Cost = 1
- Ethernet (10M): Cost = 10
- T1 (1.544M): Cost = 64
```

### Cost 설정
```bash
# Reference Bandwidth 변경
Router(config)# router ospf 1
Router(config-router)# auto-cost reference-bandwidth 10000

# 인터페이스별 Cost 수동 설정
Router(config)# interface gigabitethernet 0/0
Router(config-if)# ip ospf cost 50
```

## 실무 OSPF 설계

### 대규모 네트워크 설계 예시
```
본사 (Area 0 - Backbone)
├── 서울 지사 (Area 1)
├── 부산 지사 (Area 2)
├── 대구 지사 (Area 3)
└── DMZ (Area 10 - NSSA)
```

### 설정 예시
```bash
# 본사 Core Router (ABR)
CoreRouter(config)# router ospf 1
CoreRouter(config-router)# router-id 1.1.1.1
CoreRouter(config-router)# network 10.0.0.0 0.0.0.255 area 0
CoreRouter(config-router)# network 192.168.1.0 0.0.0.255 area 1
CoreRouter(config-router)# network 192.168.2.0 0.0.0.255 area 2

# 지사 Router
BranchRouter(config)# router ospf 1
BranchRouter(config-router)# router-id 2.2.2.2
BranchRouter(config-router)# network 192.168.1.0 0.0.0.255 area 1
BranchRouter(config-router)# network 172.16.1.0 0.0.0.255 area 1
```

## OSPF 인증

### 평문 인증
```bash
Router(config)# interface gigabitethernet 0/0
Router(config-if)# ip ospf authentication
Router(config-if)# ip ospf authentication-key mypassword
```

### MD5 인증
```bash
Router(config)# interface gigabitethernet 0/0
Router(config-if)# ip ospf authentication message-digest
Router(config-if)# ip ospf message-digest-key 1 md5 secretkey
```

### Area 레벨 인증
```bash
Router(config)# router ospf 1
Router(config-router)# area 0 authentication message-digest
```

## OSPF 최적화

### LSA Throttling
```bash
Router(config)# router ospf 1
Router(config-router)# timers throttle lsa all 100 1000 5000
```

### SPF Throttling
```bash
Router(config)# router ospf 1
Router(config-router)# timers throttle spf 100 1000 5000
```

### Summarization
```bash
# ABR에서 Area 요약
Router(config)# router ospf 1
Router(config-router)# area 1 range 192.168.0.0 255.255.252.0

# ASBR에서 외부 경로 요약
Router(config-router)# summary-address 172.16.0.0 255.255.0.0
```

## OSPF 트러블슈팅

### 기본 확인 명령어
```bash
# OSPF 프로세스 상태
Router# show ip ospf

# Neighbor 상태 확인
Router# show ip ospf neighbor

# 데이터베이스 확인
Router# show ip ospf database

# 인터페이스 상태
Router# show ip ospf interface

# 라우팅 테이블
Router# show ip route ospf
```

### 일반적인 문제와 해결

#### 1. Neighbor 관계 형성 실패
```bash
# 원인 확인
- Area ID 불일치
- Hello/Dead Timer 불일치
- 인증 설정 불일치
- Network Type 불일치

# 해결 방법
Router# debug ip ospf hello
Router# debug ip ospf adj
```

#### 2. 라우팅 루프
```bash
# 원인: Area 0 연결 문제
# 해결: Virtual Link 설정
Router(config)# router ospf 1
Router(config-router)# area 1 virtual-link 2.2.2.2
```

#### 3. 수렴 지연
```bash
# Fast Hello 설정
Router(config)# interface gigabitethernet 0/0
Router(config-if)# ip ospf hello-interval 1
Router(config-if)# ip ospf dead-interval 4
```

## 실무 모니터링

### SNMP를 통한 OSPF 모니터링
```python
# Python SNMP 모니터링 예시
from pysnmp.hlapi import *

def monitor_ospf_neighbors(router_ip):
    for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(
        SnmpEngine(),
        CommunityData('public'),
        UdpTransportTarget((router_ip, 161)),
        ContextData(),
        ObjectType(ObjectIdentity('1.3.6.1.2.1.14.10.1.3')),  # ospfNbrState
        lexicographicMode=False):
        
        if errorIndication:
            print(errorIndication)
            break
        elif errorStatus:
            print('%s at %s' % (errorStatus.prettyPrint(),
                                errorIndex and varBinds[int(errorIndex) - 1][0] or '?'))
            break
        else:
            for varBind in varBinds:
                print(' = '.join([x.prettyPrint() for x in varBind]))
```

## 골든시스 네트워크 챌린지 연관 면접 질문

### 기술적 깊이 질문
1. **"OSPF에서 Area 0가 왜 필요한가요?"**
   - 계층적 구조 유지
   - 루프 방지
   - 확장성 제공

2. **"DR/BDR이 필요한 이유는 무엇인가요?"**
   - LSA 플러딩 최적화
   - 네트워크 트래픽 감소
   - 수렴 시간 단축

3. **"OSPF Cost를 어떻게 조정하여 트래픽 엔지니어링을 하시겠습니까?"**
   - 대역폭 기반 Cost 계산
   - 수동 Cost 설정
   - 로드 밸런싱 구현

### 실무 시나리오 질문
1. **"본사와 3개 지사를 연결하는 OSPF 네트워크를 설계한다면?"**
2. **"OSPF Neighbor가 형성되지 않을 때 어떤 순서로 문제를 해결하시겠습니까?"**
3. **"네트워크 수렴 시간을 단축하려면 어떤 방법을 사용하시겠습니까?"**

### 골든시스 경험 어필 포인트
- **대규모 네트워크**: Area 설계 및 구현 경험
- **최적 경로**: Cost 조정을 통한 트래픽 제어
- **안정성**: 빠른 수렴과 루프 방지
- **확장성**: 계층적 구조 설계 능력
