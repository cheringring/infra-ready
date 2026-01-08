---
question: "⭐ Nmap과 Scapy를 활용한 네트워크 정찰 및 포트 스캐닝 기법과 보안 관제에서 이러한 공격을 탐지하는 방법을 설명해주세요."
shortAnswer: "Nmap은 포트 스캔, OS 탐지, 서비스 버전 확인에 사용되며, Scapy는 커스텀 패킷 생성 및 분석에 활용됩니다. IDS/IPS에서 스캔 패턴 탐지, 임계값 기반 알림, 행동 분석을 통해 이러한 정찰 활동을 탐지할 수 있습니다."
---

# 침투 테스트 도구 및 정찰 기법

## Nmap 기본 사용법

### 포트 스캔 유형
```bash
# TCP SYN 스캔 (스텔스 스캔)
nmap -sS 192.168.1.100
# 빠르고 로그에 남지 않음, root 권한 필요

# TCP Connect 스캔
nmap -sT 192.168.1.100
# 완전한 TCP 연결, 권한 불필요하지만 로그 기록

# UDP 스캔
nmap -sU 192.168.1.100
# DNS, DHCP, SNMP 등 UDP 서비스 탐지

# 종합 스캔
nmap -A 192.168.1.100
# OS 탐지, 서비스 버전, 스크립트 실행
```

### 탐지 회피 기법
```bash
# 타이밍 조절
nmap -T0 192.168.1.100  # 매우 느림 (IDS 회피)
nmap -T5 192.168.1.100  # 매우 빠름

# 디코이 스캔 (소스 IP 위장)
nmap -D 192.168.1.5,192.168.1.6,ME 192.168.1.100

# 소스 포트 지정
nmap --source-port 53 192.168.1.100

# 패킷 분할
nmap -f 192.168.1.100
```

## Scapy 패킷 조작

### 기본 패킷 생성
```python
from scapy.all import *

# ICMP 핑 패킷
ping = IP(dst="192.168.1.100") / ICMP()
response = sr1(ping, timeout=1)

# TCP SYN 패킷
syn = IP(dst="192.168.1.100") / TCP(dport=80, flags="S")
response = sr1(syn, timeout=1)

# 커스텀 패킷 생성
packet = IP(dst="192.168.1.100") / TCP(dport=443, flags="S") / "Custom Data"
send(packet)
```

### 포트 스캔 구현
```python
def tcp_scan(target, ports):
    open_ports = []
    
    for port in ports:
        packet = IP(dst=target) / TCP(dport=port, flags="S")
        response = sr1(packet, timeout=1, verbose=0)
        
        if response and response.haslayer(TCP):
            if response[TCP].flags == 18:  # SYN-ACK
                open_ports.append(port)
                # RST로 연결 종료
                rst = IP(dst=target) / TCP(dport=port, flags="R")
                send(rst, verbose=0)
    
    return open_ports
```

## 공격 탐지 방법

### IDS 탐지 규칙
```bash
# Snort 규칙 예시
# TCP SYN 스캔 탐지
alert tcp any any -> $HOME_NET any (msg:"SCAN TCP SYN scan"; flags:S,12; threshold:type both, track by_src, count 10, seconds 60; sid:1000100;)

# 포트 스윕 탐지
alert tcp any any -> $HOME_NET [1:1023] (msg:"SCAN Port sweep"; flags:S; threshold:type threshold, track by_src, count 15, seconds 60; sid:1000101;)
```

### 행동 기반 탐지
```python
class ScanDetector:
    def __init__(self):
        self.connections = {}
        self.scan_threshold = 10
    
    def detect_scan(self, src_ip, dst_port, timestamp):
        if src_ip not in self.connections:
            self.connections[src_ip] = []
        
        self.connections[src_ip].append({
            'port': dst_port,
            'time': timestamp
        })
        
        # 1분 내 10개 이상 포트 접근 시 스캔으로 판단
        recent_connections = [
            conn for conn in self.connections[src_ip]
            if timestamp - conn['time'] < 60
        ]
        
        if len(recent_connections) >= self.scan_threshold:
            return True
        
        return False
```

## 방어 기법

### 포트 스캔 방어
```bash
# iptables를 이용한 스캔 방어
# SYN 패킷 제한
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

# 포트 스캔 탐지 및 차단
iptables -A INPUT -p tcp --dport 1:1023 -m recent --name portscan --set -j LOG --log-prefix "Portscan detected: "
iptables -A INPUT -p tcp --dport 1:1023 -m recent --name portscan --rcheck --seconds 60 --hitcount 10 -j DROP
```

### 허니팟 구성
```python
# 간단한 허니팟 구현
import socket
import threading

class SimpleHoneypot:
    def __init__(self, port):
        self.port = port
        self.attackers = set()
    
    def start(self):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(('0.0.0.0', self.port))
        sock.listen(5)
        
        while True:
            conn, addr = sock.accept()
            self.attackers.add(addr[0])
            print(f"허니팟 접근 탐지: {addr[0]}:{addr[1]}")
            conn.close()
```

## 실무 면접 예상 질문

### 기술적 질문
1. **"Nmap의 -sS와 -sT 스캔의 차이점은?"**
   - sS: SYN 스캔 (스텔스, root 권한 필요)
   - sT: Connect 스캔 (완전 연결, 로그 기록)

2. **"Scapy로 커스텀 패킷을 만드는 이유는?"**
   - 기존 도구로 불가능한 특수 테스트
   - 프로토콜 연구 및 분석
   - 정교한 공격 시뮬레이션

### 방어 관점 질문
1. **"포트 스캔을 탐지하는 방법들은?"**
   - 연결 시도 빈도 모니터링
   - SYN 패킷 패턴 분석
   - 임계값 기반 알림

2. **"정상 트래픽과 스캔 트래픽 구분 기준은?"**
   - 접근 포트 수와 패턴
   - 시간당 연결 시도 횟수
   - 플래그 조합의 비정상성

### KISA 교육 경험 어필 포인트
- **도구 활용**: Nmap, Scapy 등 전문 도구 사용 경험
- **공격 이해**: 정찰 단계부터 침투까지 전 과정 이해
- **방어 관점**: 공격자 시각에서 방어 체계 강화 방안 도출
- **윤리적 해킹**: 허가된 환경에서만 테스트 수행
- **실무 적용**: 보안 점검 및 취약점 진단 능력

### 실무 시나리오 질문
1. **"내부 네트워크에서 의심스러운 스캔 활동이 탐지되었을 때 대응 방법은?"**
2. **"침투 테스트 시 어떤 순서로 정찰을 수행하시겠습니까?"**
3. **"Nmap 스캔이 탐지되지 않도록 하는 방법들은?"**
