---
question: "VLAN과 Trunking의 개념을 설명하고, 실무에서 네트워크 트래픽을 효율적으로 분리하고 제어하는 방법을 설명해주세요."
shortAnswer: "VLAN은 물리적으로 같은 스위치에 연결된 장비들을 논리적으로 분리하는 기술이고, Trunking은 여러 VLAN 트래픽을 하나의 링크로 전송하는 기술입니다. 802.1Q 태깅을 통해 VLAN ID를 구분하며, 보안과 성능 향상을 제공합니다."
---

# VLAN과 Trunking

## VLAN (Virtual Local Area Network) 기본 개념

### VLAN이란?
- **정의**: 물리적 네트워크를 논리적으로 분할하는 기술
- **목적**: 브로드캐스트 도메인 분리, 보안 강화, 트래픽 관리
- **범위**: Layer 2 (데이터링크 계층) 기술

### VLAN의 장점
```
기존 물리적 분리:
Switch1 (개발팀) --- Switch2 (영업팀) --- Switch3 (관리팀)
└─ 비용 증가, 관리 복잡

VLAN 논리적 분리:
       Switch (하나의 물리적 스위치)
    ┌─────────┼─────────┐
VLAN 10    VLAN 20    VLAN 30
(개발팀)    (영업팀)    (관리팀)
└─ 비용 절약, 유연한 관리
```

### VLAN 유형

#### 1. Port-based VLAN (Static VLAN)
```bash
# Cisco 스위치 설정 예시
Switch(config)# vlan 10
Switch(config-vlan)# name Development
Switch(config-vlan)# exit

Switch(config)# vlan 20
Switch(config-vlan)# name Sales
Switch(config-vlan)# exit

# 포트에 VLAN 할당
Switch(config)# interface fastethernet 0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10

Switch(config)# interface fastethernet 0/2
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 20
```

#### 2. MAC-based VLAN (Dynamic VLAN)
```bash
# MAC 주소 기반 VLAN 할당
Switch(config)# mac address-table static 0012.3456.789a vlan 10 interface fa0/1
```

#### 3. Protocol-based VLAN
```bash
# 프로토콜 기반 VLAN (IP, IPX 등)
Switch(config)# vlan 30
Switch(config-vlan)# name IP_VLAN
```

## Trunking 개념

### Trunking이란?
- **정의**: 여러 VLAN의 트래픽을 하나의 물리적 링크로 전송
- **필요성**: 스위치 간 모든 VLAN 통신을 위해
- **표준**: IEEE 802.1Q (가장 일반적)

### 802.1Q 태깅
```
일반 이더넷 프레임:
[Dest MAC][Src MAC][Type/Length][Data][FCS]

802.1Q 태그된 프레임:
[Dest MAC][Src MAC][802.1Q Tag][Type/Length][Data][FCS]
                    └─ VLAN ID 포함 (12bit = 4096개 VLAN)
```

### Trunk 포트 설정
```bash
# Cisco 스위치 Trunk 설정
Switch(config)# interface gigabitethernet 0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20,30
Switch(config-if)# switchport trunk native vlan 1

# Trunk 상태 확인
Switch# show interfaces trunk
Switch# show vlan brief
```

## 실무 네트워크 설계 시나리오

### 기업 네트워크 VLAN 설계
```
회사 네트워크 구성:
├── VLAN 10: 관리부서 (192.168.10.0/24)
├── VLAN 20: 개발부서 (192.168.20.0/24)
├── VLAN 30: 영업부서 (192.168.30.0/24)
├── VLAN 40: 게스트 네트워크 (192.168.40.0/24)
├── VLAN 50: 서버 네트워크 (192.168.50.0/24)
└── VLAN 99: 관리 VLAN (192.168.99.0/24)
```

### 스위치 간 연결 구성
```bash
# Core Switch 설정
CoreSW(config)# vlan 10,20,30,40,50,99
CoreSW(config)# interface range gi0/1-4
CoreSW(config-if-range)# switchport mode trunk
CoreSW(config-if-range)# switchport trunk allowed vlan all

# Access Switch 설정
AccessSW1(config)# vlan 10,20
AccessSW1(config)# interface gi0/1
AccessSW1(config-if)# switchport mode trunk
AccessSW1(config-if)# switchport trunk allowed vlan 10,20

# 사용자 포트 설정
AccessSW1(config)# interface range fa0/1-12
AccessSW1(config-if-range)# switchport mode access
AccessSW1(config-if-range)# switchport access vlan 10

AccessSW1(config)# interface range fa0/13-24
AccessSW1(config-if-range)# switchport mode access
AccessSW1(config-if-range)# switchport access vlan 20
```

## Inter-VLAN Routing

### Router-on-a-Stick 구성
```bash
# 라우터 서브인터페이스 설정
Router(config)# interface gigabitethernet 0/0
Router(config-if)# no shutdown

Router(config)# interface gigabitethernet 0/0.10
Router(config-subif)# encapsulation dot1Q 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0

Router(config)# interface gigabitethernet 0/0.20
Router(config-subif)# encapsulation dot1Q 20
Router(config-subif)# ip address 192.168.20.1 255.255.255.0

Router(config)# interface gigabitethernet 0/0.30
Router(config-subif)# encapsulation dot1Q 30
Router(config-subif)# ip address 192.168.30.1 255.255.255.0
```

### Layer 3 스위치를 이용한 Inter-VLAN Routing
```bash
# L3 스위치 SVI(Switched Virtual Interface) 설정
L3Switch(config)# ip routing
L3Switch(config)# vlan 10,20,30

L3Switch(config)# interface vlan 10
L3Switch(config-if)# ip address 192.168.10.1 255.255.255.0
L3Switch(config-if)# no shutdown

L3Switch(config)# interface vlan 20
L3Switch(config-if)# ip address 192.168.20.1 255.255.255.0
L3Switch(config-if)# no shutdown

L3Switch(config)# interface vlan 30
L3Switch(config-if)# ip address 192.168.30.1 255.255.255.0
L3Switch(config-if)# no shutdown
```

## VLAN 보안 고려사항

### VLAN Hopping 공격 방어
```bash
# 1. Native VLAN 변경
Switch(config)# interface gi0/1
Switch(config-if)# switchport trunk native vlan 999

# 2. 사용하지 않는 포트 비활성화
Switch(config)# interface range fa0/20-24
Switch(config-if-range)# shutdown
Switch(config-if-range)# switchport access vlan 999

# 3. DTP(Dynamic Trunking Protocol) 비활성화
Switch(config)# interface range fa0/1-19
Switch(config-if-range)# switchport mode access
Switch(config-if-range)# switchport nonegotiate
```

### Private VLAN 구성
```bash
# Primary VLAN 설정
Switch(config)# vlan 100
Switch(config-vlan)# private-vlan primary

# Secondary VLAN 설정 (Isolated)
Switch(config)# vlan 101
Switch(config-vlan)# private-vlan isolated

# Secondary VLAN 설정 (Community)
Switch(config)# vlan 102
Switch(config-vlan)# private-vlan community

# Primary와 Secondary 연결
Switch(config)# vlan 100
Switch(config-vlan)# private-vlan association 101,102
```

## 실무 트러블슈팅

### VLAN 연결 문제 진단
```bash
# 1. VLAN 설정 확인
Switch# show vlan brief
Switch# show vlan id 10

# 2. 포트 상태 확인
Switch# show interfaces status
Switch# show interfaces fa0/1 switchport

# 3. Trunk 상태 확인
Switch# show interfaces trunk
Switch# show spanning-tree vlan 10

# 4. MAC 주소 테이블 확인
Switch# show mac address-table vlan 10
```

### 성능 최적화
```bash
# Spanning Tree 최적화
Switch(config)# spanning-tree mode rapid-pvst
Switch(config)# spanning-tree vlan 10 priority 4096

# Port-Fast 설정 (엔드 디바이스 포트)
Switch(config)# interface range fa0/1-20
Switch(config-if-range)# spanning-tree portfast

# BPDU Guard 설정
Switch(config-if-range)# spanning-tree bpduguard enable
```

## 대규모 네트워크 설계 고려사항

### VLAN 번호 체계
```
표준 VLAN 번호 체계:
├── 1-99: 관리 및 인프라 VLAN
├── 100-199: 사용자 VLAN (부서별)
├── 200-299: 서버 VLAN (용도별)
├── 300-399: 게스트 및 임시 VLAN
├── 400-499: IoT 및 특수 장비 VLAN
└── 500-599: DMZ 및 보안 VLAN
```

### 확장성 고려사항
```bash
# VTP(VLAN Trunking Protocol) 설정
Switch(config)# vtp mode server
Switch(config)# vtp domain COMPANY
Switch(config)# vtp password cisco123

# 클라이언트 스위치
ClientSW(config)# vtp mode client
ClientSW(config)# vtp domain COMPANY
ClientSW(config)# vtp password cisco123
```

## 모니터링 및 관리

### VLAN 트래픽 모니터링
```bash
# 포트별 트래픽 통계
Switch# show interfaces fa0/1 counters
Switch# show interfaces fa0/1 counters errors

# VLAN별 통계 (SNMP 활용)
Switch(config)# snmp-server community public ro
Switch(config)# snmp-server host 192.168.1.100 public
```

### 자동화 스크립트 예시
```python
# Python을 이용한 VLAN 설정 자동화
import paramiko

def configure_vlan(switch_ip, vlan_id, vlan_name, ports):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(switch_ip, username='admin', password='password')
        
        commands = [
            f'configure terminal',
            f'vlan {vlan_id}',
            f'name {vlan_name}',
            f'exit'
        ]
        
        # 포트에 VLAN 할당
        for port in ports:
            commands.extend([
                f'interface {port}',
                f'switchport mode access',
                f'switchport access vlan {vlan_id}',
                f'exit'
            ])
        
        commands.append('end')
        commands.append('write memory')
        
        for command in commands:
            stdin, stdout, stderr = ssh.exec_command(command)
            print(f"Executed: {command}")
            
    finally:
        ssh.close()

# 사용 예시
configure_vlan('192.168.1.10', 100, 'Development', 
               ['fa0/1', 'fa0/2', 'fa0/3'])
```

## 실무 면접 예상 질문

### 기술적 질문
1. **"VLAN과 서브넷의 차이점은 무엇인가요?"**
   - VLAN: Layer 2 논리적 분리
   - 서브넷: Layer 3 IP 주소 범위 분할

2. **"Native VLAN이 무엇이고 왜 중요한가요?"**
   - 태그되지 않은 트래픽이 속하는 VLAN
   - 보안상 기본값(1) 변경 권장

3. **"VLAN Hopping 공격을 어떻게 방어하나요?"**
   - DTP 비활성화, Native VLAN 변경
   - 사용하지 않는 포트 shutdown

### 실무 시나리오 질문
1. **"새로운 부서가 생겼을 때 네트워크를 어떻게 확장하시겠습니까?"**
2. **"VLAN 간 통신이 안 될 때 어떤 순서로 문제를 해결하시겠습니까?"**
3. **"100명 규모의 사무실 네트워크를 VLAN으로 설계한다면?"**

## 골든시스 네트워크 챌린지 연관 포인트

### 실무 경험 어필 포인트
- **트래픽 분리**: 부서별/용도별 VLAN 설계 경험
- **성능 최적화**: Spanning Tree, Port-Fast 설정
- **보안 강화**: VLAN Hopping 방어, Private VLAN
- **확장성**: 대규모 네트워크 환경 고려

### 면접에서 강조할 점
- **실제 구축 경험**: 이론이 아닌 실습을 통한 학습
- **문제 해결 능력**: 트러블슈팅 경험
- **설계 사고**: 비즈니스 요구사항을 네트워크로 구현
- **보안 의식**: 네트워크 보안 고려사항 이해
