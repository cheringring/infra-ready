---
question: "대규모 기업 네트워크 설계 시 고려해야 할 요소들과 3-Tier 아키텍처, 그리고 네트워크 세분화(Network Segmentation) 전략을 설명해주세요."
shortAnswer: "대규모 네트워크는 3-Tier(Core-Distribution-Access) 아키텍처로 설계하며, 확장성, 가용성, 보안을 고려해야 합니다. 네트워크 세분화를 통해 브로드캐스트 도메인을 분리하고 보안을 강화합니다."
---

# 대규모 네트워크 설계 및 아키텍처

## 네트워크 설계 기본 원칙

### 설계 고려사항
```
1. 확장성 (Scalability)
   - 사용자 증가에 대응
   - 대역폭 확장 가능성
   - 장비 추가 용이성

2. 가용성 (Availability)
   - 이중화 구성
   - 장애 시 자동 복구
   - SLA 목표 달성

3. 성능 (Performance)
   - 지연시간 최소화
   - 처리량 최대화
   - QoS 보장

4. 보안 (Security)
   - 네트워크 분할
   - 접근 제어
   - 트래픽 모니터링

5. 관리성 (Manageability)
   - 중앙 집중 관리
   - 자동화 가능
   - 문제 진단 용이
```

## 3-Tier 네트워크 아키텍처

### 계층별 역할과 특징

#### 1. Core Layer (코어 계층)
```
역할:
- 고속 패킷 포워딩
- 백본 연결
- 최소한의 정책 적용

특징:
- 고성능 스위치/라우터
- 이중화 구성 필수
- 복잡한 기능 최소화

장비 예시:
- Cisco Catalyst 9600/9500 시리즈
- Juniper EX9200 시리즈
```

#### 2. Distribution Layer (분배 계층)
```
역할:
- 라우팅 정책 적용
- VLAN 간 라우팅
- 보안 정책 구현
- QoS 정책 적용

특징:
- L3 스위치 주로 사용
- 방화벽 기능 통합
- 로드 밸런싱

장비 예시:
- Cisco Catalyst 9400 시리즈
- Arista 7280R 시리즈
```

#### 3. Access Layer (액세스 계층)
```
역할:
- 엔드 디바이스 연결
- 포트 보안 적용
- VLAN 할당

특징:
- 포트 밀도 높음
- PoE 지원
- 저비용 구성

장비 예시:
- Cisco Catalyst 9200/9300 시리즈
- HP Aruba 2930F 시리즈
```

### 3-Tier 설계 예시
```
                [Internet]
                     |
              [Core Switch 1] ---- [Core Switch 2]
                 |       |            |       |
        [Dist SW 1]   [Dist SW 2]  [Dist SW 3]  [Dist SW 4]
         |     |       |     |      |     |      |     |
    [Access] [Access] [Access] [Access] [Access] [Access] [Access] [Access]
      SW1     SW2      SW3     SW4     SW5     SW6     SW7     SW8
       |       |        |       |       |       |       |       |
   [Users]  [Users]  [Users] [Users] [Users] [Users] [Users] [Users]
```

## 네트워크 세분화 (Network Segmentation)

### 세분화 전략

#### 1. 기능별 세분화
```
네트워크 구분:
├── 사용자 네트워크 (User Network)
│   ├── 임원진 (Executive)
│   ├── 일반 직원 (Staff)
│   └── 게스트 (Guest)
├── 서버 네트워크 (Server Network)
│   ├── 웹 서버 (Web Servers)
│   ├── 데이터베이스 (Database)
│   └── 파일 서버 (File Servers)
├── 관리 네트워크 (Management)
│   ├── 네트워크 장비 관리
│   └── 서버 관리
└── DMZ (Demilitarized Zone)
    ├── 공개 웹 서버
    └── 메일 서버
```

#### 2. 지리적 세분화
```bash
# 본사-지사 간 WAN 연결
본사 (Headquarters)
├── 서울 본사 (10.1.0.0/16)
├── 부산 지사 (10.2.0.0/16)
├── 대구 지사 (10.3.0.0/16)
└── 광주 지사 (10.4.0.0/16)

# OSPF Area 설계
Area 0: 본사 백본 (10.1.0.0/16)
Area 1: 부산 지사 (10.2.0.0/16)
Area 2: 대구 지사 (10.3.0.0/16)
Area 3: 광주 지사 (10.4.0.0/16)
```

### VLAN 설계 전략
```bash
# 표준 VLAN 번호 체계
VLAN 10-19: 관리 VLAN
├── VLAN 10: 네트워크 관리 (192.168.10.0/24)
├── VLAN 11: 서버 관리 (192.168.11.0/24)
└── VLAN 19: Out-of-Band 관리 (192.168.19.0/24)

VLAN 20-99: 사용자 VLAN
├── VLAN 20: 임원진 (192.168.20.0/24)
├── VLAN 30: 개발팀 (192.168.30.0/24)
├── VLAN 40: 영업팀 (192.168.40.0/24)
├── VLAN 50: 마케팅팀 (192.168.50.0/24)
└── VLAN 99: 게스트 (192.168.99.0/24)

VLAN 100-199: 서버 VLAN
├── VLAN 100: 웹 서버 (192.168.100.0/24)
├── VLAN 110: 데이터베이스 (192.168.110.0/24)
├── VLAN 120: 파일 서버 (192.168.120.0/24)
└── VLAN 130: 백업 서버 (192.168.130.0/24)

VLAN 200-299: DMZ
├── VLAN 200: 공개 웹 서버 (192.168.200.0/24)
├── VLAN 210: 메일 서버 (192.168.210.0/24)
└── VLAN 220: DNS 서버 (192.168.220.0/24)
```

## 고가용성 설계

### 이중화 구성

#### 1. 링크 이중화
```bash
# LACP (Link Aggregation Control Protocol)
Switch(config)# interface port-channel 1
Switch(config-if)# switchport mode trunk

Switch(config)# interface range gi0/1-2
Switch(config-if-range)# channel-group 1 mode active
Switch(config-if-range)# switchport mode trunk
```

#### 2. 장비 이중화
```bash
# HSRP (Hot Standby Router Protocol) 설정
Router1(config)# interface vlan 10
Router1(config-if)# ip address 192.168.10.2 255.255.255.0
Router1(config-if)# standby 1 ip 192.168.10.1
Router1(config-if)# standby 1 priority 110
Router1(config-if)# standby 1 preempt

Router2(config)# interface vlan 10
Router2(config-if)# ip address 192.168.10.3 255.255.255.0
Router2(config-if)# standby 1 ip 192.168.10.1
Router2(config-if)# standby 1 priority 100
```

#### 3. 경로 이중화
```bash
# 다중 경로 설정
Router(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1 100
Router(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.5 200

# OSPF Equal Cost Multi-Path
Router(config)# router ospf 1
Router(config-router)# maximum-paths 4
```

## 보안 설계

### 네트워크 보안 계층

#### 1. 경계 보안 (Perimeter Security)
```bash
# 방화벽 정책 예시
외부 → DMZ: HTTP(80), HTTPS(443) 허용
외부 → 내부: 모든 트래픽 차단
DMZ → 내부: 필요한 서비스만 허용
내부 → 외부: 정책 기반 허용
```

#### 2. 내부 네트워크 보안
```bash
# ACL을 이용한 VLAN 간 접근 제어
Router(config)# ip access-list extended SALES_TO_SERVER
Router(config-ext-nacl)# permit tcp 192.168.40.0 0.0.0.255 192.168.100.0 0.0.0.255 eq 80
Router(config-ext-nacl)# permit tcp 192.168.40.0 0.0.0.255 192.168.100.0 0.0.0.255 eq 443
Router(config-ext-nacl)# deny ip any any

Router(config)# interface vlan 40
Router(config-if)# ip access-group SALES_TO_SERVER out
```

#### 3. 포트 보안
```bash
# 스위치 포트 보안 설정
Switch(config)# interface fa0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 30
Switch(config-if)# switchport port-security
Switch(config-if)# switchport port-security maximum 2
Switch(config-if)# switchport port-security violation restrict
Switch(config-if)# switchport port-security mac-address sticky
```

## QoS (Quality of Service) 설계

### 트래픽 분류 및 우선순위
```bash
# 트래픽 분류
Voice Traffic (VoIP):     우선순위 1 (최고)
Video Traffic:            우선순위 2
Critical Data:            우선순위 3
Normal Data:              우선순위 4
Bulk Data (Backup):       우선순위 5 (최저)
```

### QoS 구현
```bash
# Class Map 정의
Router(config)# class-map match-all VOICE
Router(config-cmap)# match dscp ef

Router(config)# class-map match-all VIDEO
Router(config-cmap)# match dscp af41

# Policy Map 정의
Router(config)# policy-map WAN_QOS
Router(config-pmap)# class VOICE
Router(config-pmap-c)# priority percent 30
Router(config-pmap-c)# class VIDEO
Router(config-pmap-c)# bandwidth percent 40
Router(config-pmap-c)# class class-default
Router(config-pmap-c)# bandwidth percent 30

# 인터페이스에 적용
Router(config)# interface serial 0/0
Router(config-if)# service-policy output WAN_QOS
```

## 네트워크 모니터링 및 관리

### 중앙 집중 관리

#### 1. SNMP 기반 모니터링
```bash
# SNMP 설정
Switch(config)# snmp-server community public ro
Switch(config)# snmp-server community private rw
Switch(config)# snmp-server host 192.168.10.100 public
Switch(config)# snmp-server enable traps
```

#### 2. Syslog 중앙 집중
```bash
# Syslog 서버 설정
Router(config)# logging host 192.168.10.200
Router(config)# logging trap informational
Router(config)# logging facility local0
```

#### 3. NetFlow 트래픽 분석
```bash
# NetFlow 설정
Router(config)# ip flow-export destination 192.168.10.300 9996
Router(config)# ip flow-export source loopback 0
Router(config)# ip flow-export version 9

Router(config)# interface gigabitethernet 0/0
Router(config-if)# ip flow ingress
Router(config-if)# ip flow egress
```

## 실무 설계 시나리오

### 500명 규모 기업 네트워크 설계
```
요구사항:
- 본사 300명, 지사 2곳 각 100명
- 서버실 별도 구성
- 게스트 네트워크 필요
- 고가용성 필수
- 보안 강화 필요

설계안:
1. 3-Tier 아키텍처 적용
2. VLAN 기반 네트워크 분할
3. OSPF 동적 라우팅
4. HSRP 이중화 구성
5. 방화벽 및 IPS 적용
6. QoS 정책 구현
```

### 네트워크 용량 계획
```python
# 대역폭 계산 예시
def calculate_bandwidth_requirements():
    users = {
        'executives': {'count': 20, 'bandwidth_per_user': 10},  # 10 Mbps
        'developers': {'count': 50, 'bandwidth_per_user': 5},   # 5 Mbps
        'staff': {'count': 200, 'bandwidth_per_user': 2},       # 2 Mbps
        'guests': {'count': 30, 'bandwidth_per_user': 1}        # 1 Mbps
    }
    
    total_bandwidth = 0
    for user_type, info in users.items():
        bandwidth = info['count'] * info['bandwidth_per_user']
        total_bandwidth += bandwidth
        print(f"{user_type}: {bandwidth} Mbps")
    
    # 오버서브스크립션 비율 적용 (일반적으로 20:1)
    oversubscription_ratio = 0.3  # 30% 동시 사용률
    required_bandwidth = total_bandwidth * oversubscription_ratio
    
    print(f"총 대역폭: {total_bandwidth} Mbps")
    print(f"실제 필요 대역폭: {required_bandwidth} Mbps")
    
    return required_bandwidth

calculate_bandwidth_requirements()
```

## 네트워크 문서화

### 설계 문서 구성
```
1. 네트워크 토폴로지 다이어그램
2. IP 주소 할당 계획
3. VLAN 설계 문서
4. 라우팅 프로토콜 설정
5. 보안 정책 문서
6. QoS 정책 문서
7. 장애 복구 절차
8. 변경 관리 절차
```

### 자동화된 문서 생성
```python
# 네트워크 인벤토리 자동 생성
import paramiko
import json

def collect_network_inventory(devices):
    inventory = {}
    
    for device in devices:
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(device['ip'], username=device['username'], 
                       password=device['password'])
            
            # 장비 정보 수집
            stdin, stdout, stderr = ssh.exec_command('show version')
            version_info = stdout.read().decode()
            
            stdin, stdout, stderr = ssh.exec_command('show ip interface brief')
            interface_info = stdout.read().decode()
            
            inventory[device['ip']] = {
                'hostname': device['hostname'],
                'version': version_info,
                'interfaces': interface_info
            }
            
            ssh.close()
            
        except Exception as e:
            print(f"Error connecting to {device['ip']}: {e}")
    
    return inventory

# 사용 예시
devices = [
    {'ip': '192.168.1.1', 'hostname': 'Core-SW-01', 'username': 'admin', 'password': 'password'},
    {'ip': '192.168.1.2', 'hostname': 'Core-SW-02', 'username': 'admin', 'password': 'password'}
]

inventory = collect_network_inventory(devices)
with open('network_inventory.json', 'w') as f:
    json.dump(inventory, f, indent=2)
```

## 골든시스 네트워크 챌린지 연관 면접 질문

### 설계 역량 평가 질문
1. **"500명 규모의 기업 네트워크를 설계한다면 어떤 아키텍처를 선택하시겠습니까?"**
   - 3-Tier 아키텍처 선택 이유
   - 각 계층별 역할과 장비 선정
   - 확장성 고려사항

2. **"네트워크 세분화를 통해 보안을 강화하는 방법은?"**
   - VLAN 기반 분할
   - 마이크로 세그멘테이션
   - Zero Trust 네트워크

3. **"고가용성을 보장하기 위한 이중화 전략은?"**
   - 링크, 장비, 경로 이중화
   - HSRP/VRRP 구성
   - STP 최적화

### 실무 경험 어필 포인트
- **대규모 네트워크 설계**: 계층적 구조 이해
- **트래픽 엔지니어링**: OSPF Cost 조정 경험
- **보안 고려**: 네트워크 분할과 접근 제어
- **성능 최적화**: QoS와 대역폭 관리
- **문제 해결**: 체계적인 트러블슈팅 능력

### 기술적 심화 질문
1. **"VLAN과 서브넷의 차이점과 각각의 활용 시나리오는?"**
2. **"Spanning Tree Protocol이 대규모 네트워크에서 중요한 이유는?"**
3. **"네트워크 수렴 시간을 단축하기 위한 방법들은?"**
