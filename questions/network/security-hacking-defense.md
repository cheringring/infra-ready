---
question: "네트워크 보안 위협(DoS/DDoS, MITM, ARP Spoofing)의 공격 원리와 방어 기법, 그리고 침입 탐지/차단 시스템(IDS/IPS)의 차이점을 설명해주세요."
shortAnswer: "DoS/DDoS는 서비스 가용성 공격, MITM은 통신 중간 가로채기, ARP Spoofing은 MAC 주소 위조 공격입니다. IDS는 탐지만, IPS는 실시간 차단까지 수행하며, 패킷 분석과 시그니처 기반으로 위협을 식별합니다."
---

# 네트워크 보안 위협 및 방어 기법

## DoS/DDoS 공격과 방어

### DoS (Denial of Service) 공격 유형
```python
# SYN Flood 공격 시뮬레이션 (교육용)
from scapy.all import *
import random

def syn_flood_simulation(target_ip, target_port, packet_count=1000):
    """SYN Flood 공격 시뮬레이션 (교육 목적)"""
    print(f"SYN Flood 시뮬레이션: {target_ip}:{target_port}")
    
    for i in range(packet_count):
        # 랜덤 소스 IP 생성
        source_ip = ".".join([str(random.randint(1,254)) for _ in range(4)])
        source_port = random.randint(1024, 65535)
        
        # SYN 패킷 생성
        ip_layer = IP(src=source_ip, dst=target_ip)
        tcp_layer = TCP(sport=source_port, dport=target_port, flags="S")
        
        packet = ip_layer / tcp_layer
        
        # 패킷 전송 (실제로는 전송하지 않음)
        print(f"SYN packet {i+1}: {source_ip}:{source_port} -> {target_ip}:{target_port}")
        
        if i % 100 == 0:
            print(f"진행률: {i/packet_count*100:.1f}%")

# 교육용 시뮬레이션 (실제 공격 X)
# syn_flood_simulation("192.168.1.100", 80, 500)
```

### DDoS 방어 기법
```bash
# iptables를 이용한 DDoS 방어
#!/bin/bash

# SYN Flood 방어
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

# Connection limit (IP당 연결 수 제한)
iptables -A INPUT -p tcp --dport 80 -m connlimit --connlimit-above 20 -j DROP

# Rate limiting (초당 패킷 수 제한)
iptables -A INPUT -p tcp --dport 80 -m recent --name http --set
iptables -A INPUT -p tcp --dport 80 -m recent --name http --rcheck --seconds 1 --hitcount 10 -j DROP

# ICMP Flood 방어
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -j DROP
```

## MITM (Man-in-the-Middle) 공격

### ARP Spoofing 공격 원리
```python
# ARP Spoofing 탐지 스크립트
import subprocess
import re
from collections import defaultdict
import time

class ARPSpoofingDetector:
    def __init__(self):
        self.arp_table = defaultdict(set)
        self.suspicious_entries = []
    
    def get_arp_table(self):
        """현재 ARP 테이블 조회"""
        try:
            result = subprocess.run(['arp', '-a'], capture_output=True, text=True)
            return result.stdout
        except Exception as e:
            print(f"ARP 테이블 조회 실패: {e}")
            return ""
    
    def parse_arp_entries(self, arp_output):
        """ARP 엔트리 파싱"""
        entries = []
        pattern = r'\((\d+\.\d+\.\d+\.\d+)\) at ([a-fA-F0-9:]{17})'
        
        for line in arp_output.split('\n'):
            match = re.search(pattern, line)
            if match:
                ip_addr = match.group(1)
                mac_addr = match.group(2).lower()
                entries.append((ip_addr, mac_addr))
        
        return entries
    
    def detect_spoofing(self):
        """ARP Spoofing 탐지"""
        arp_output = self.get_arp_table()
        current_entries = self.parse_arp_entries(arp_output)
        
        for ip, mac in current_entries:
            # 같은 IP에 대해 다른 MAC 주소가 나타나면 의심
            if ip in self.arp_table and mac not in self.arp_table[ip]:
                self.suspicious_entries.append({
                    'ip': ip,
                    'old_mac': list(self.arp_table[ip]),
                    'new_mac': mac,
                    'timestamp': time.time()
                })
                print(f"⚠️  ARP Spoofing 의심: {ip}")
                print(f"   기존 MAC: {list(self.arp_table[ip])}")
                print(f"   새로운 MAC: {mac}")
            
            self.arp_table[ip].add(mac)
    
    def monitor_continuous(self, interval=5):
        """지속적 모니터링"""
        print("ARP Spoofing 탐지 시작...")
        while True:
            self.detect_spoofing()
            time.sleep(interval)

# 사용 예시
detector = ARPSpoofingDetector()
# detector.monitor_continuous()
```

### SSL/TLS 인증서 검증
```python
# SSL 인증서 검증
import ssl
import socket
from datetime import datetime

class SSLCertificateValidator:
    def __init__(self):
        self.trusted_cas = []
    
    def verify_certificate(self, hostname, port=443):
        """SSL 인증서 검증"""
        try:
            context = ssl.create_default_context()
            
            with socket.create_connection((hostname, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    
                    # 인증서 정보 추출
                    subject = dict(x[0] for x in cert['subject'])
                    issuer = dict(x[0] for x in cert['issuer'])
                    
                    # 유효기간 확인
                    not_before = datetime.strptime(cert['notBefore'], '%b %d %H:%M:%S %Y %Z')
                    not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    now = datetime.now()
                    
                    validation_result = {
                        'hostname': hostname,
                        'subject': subject.get('commonName', 'Unknown'),
                        'issuer': issuer.get('organizationName', 'Unknown'),
                        'valid_from': not_before,
                        'valid_until': not_after,
                        'is_valid': not_before <= now <= not_after,
                        'days_until_expiry': (not_after - now).days,
                        'san': cert.get('subjectAltName', [])
                    }
                    
                    return validation_result
                    
        except Exception as e:
            return {'error': str(e), 'hostname': hostname}
    
    def check_certificate_pinning(self, hostname, expected_fingerprint):
        """인증서 핀닝 검증"""
        try:
            cert_der = ssl.get_server_certificate((hostname, 443), ssl_version=ssl.PROTOCOL_TLS)
            cert_fingerprint = hashlib.sha256(cert_der.encode()).hexdigest()
            
            return cert_fingerprint == expected_fingerprint
        except Exception as e:
            return False

# 사용 예시
validator = SSLCertificateValidator()
result = validator.verify_certificate('google.com')
print(f"인증서 검증 결과: {result}")
```

## 웹 애플리케이션 보안

### SQL Injection 방어
```python
# SQL Injection 방어 기법
import sqlite3
from typing import List, Dict, Any

class SecureDatabase:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.connection = sqlite3.connect(db_path)
        self.cursor = self.connection.cursor()
    
    def safe_query(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """안전한 SQL 쿼리 실행 (Prepared Statement 사용)"""
        try:
            # Prepared Statement 사용으로 SQL Injection 방지
            self.cursor.execute(query, params)
            
            # 컬럼 이름 가져오기
            columns = [description[0] for description in self.cursor.description]
            
            # 결과를 딕셔너리 형태로 반환
            results = []
            for row in self.cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            return results
            
        except sqlite3.Error as e:
            print(f"데이터베이스 오류: {e}")
            return []
    
    def validate_input(self, user_input: str) -> bool:
        """입력값 검증"""
        # 위험한 SQL 키워드 차단
        dangerous_keywords = [
            'DROP', 'DELETE', 'UPDATE', 'INSERT', 'EXEC', 'UNION', 
            'SELECT', '--', ';', '/*', '*/', 'xp_', 'sp_'
        ]
        
        user_input_upper = user_input.upper()
        for keyword in dangerous_keywords:
            if keyword in user_input_upper:
                return False
        
        return True
    
    def search_users(self, username: str) -> List[Dict[str, Any]]:
        """사용자 검색 (안전한 방식)"""
        # 입력값 검증
        if not self.validate_input(username):
            return []
        
        # Prepared Statement 사용
        query = "SELECT id, username, email FROM users WHERE username LIKE ?"
        params = (f"%{username}%",)
        
        return self.safe_query(query, params)

# 위험한 방식 (사용 금지)
def unsafe_query_example(username):
    """SQL Injection에 취약한 코드 예시 (사용 금지!)"""
    # 이런 방식은 절대 사용하면 안 됨
    query = f"SELECT * FROM users WHERE username = '{username}'"
    # username에 "'; DROP TABLE users; --" 입력 시 테이블 삭제됨
    return query

# 안전한 사용 예시
db = SecureDatabase('example.db')
results = db.search_users('admin')
```

### XSS (Cross-Site Scripting) 방어
```python
# XSS 방어 기법
import html
import re
from urllib.parse import quote

class XSSProtection:
    def __init__(self):
        self.allowed_tags = ['b', 'i', 'u', 'strong', 'em']
        self.dangerous_patterns = [
            r'<script.*?>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe.*?>',
            r'<object.*?>',
            r'<embed.*?>'
        ]
    
    def sanitize_input(self, user_input: str) -> str:
        """사용자 입력 sanitization"""
        if not user_input:
            return ""
        
        # HTML 엔티티 인코딩
        sanitized = html.escape(user_input)
        
        # 위험한 패턴 제거
        for pattern in self.dangerous_patterns:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
        
        return sanitized
    
    def validate_url(self, url: str) -> bool:
        """URL 검증"""
        if not url:
            return False
        
        # 허용된 프로토콜만 허용
        allowed_protocols = ['http://', 'https://']
        
        url_lower = url.lower()
        if not any(url_lower.startswith(protocol) for protocol in allowed_protocols):
            return False
        
        # javascript: 프로토콜 차단
        if 'javascript:' in url_lower:
            return False
        
        return True
    
    def create_safe_link(self, url: str, text: str) -> str:
        """안전한 링크 생성"""
        if not self.validate_url(url):
            return self.sanitize_input(text)
        
        safe_url = quote(url, safe=':/?#[]@!$&\'()*+,;=')
        safe_text = self.sanitize_input(text)
        
        return f'<a href="{safe_url}" rel="noopener noreferrer" target="_blank">{safe_text}</a>'

# CSP (Content Security Policy) 헤더 설정
def set_csp_headers():
    """CSP 헤더 설정 예시"""
    csp_policy = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://trusted-cdn.com; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' https://fonts.googleapis.com; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
    
    return {
        'Content-Security-Policy': csp_policy,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    }
```

## IDS/IPS 시스템

### IDS vs IPS 비교
```
IDS (Intrusion Detection System):
├── 기능: 침입 탐지 및 알림
├── 위치: 네트워크 외부 (미러 포트)
├── 동작: 패시브 모니터링
├── 응답: 알림 및 로깅
└── 장점: 네트워크 성능에 영향 없음

IPS (Intrusion Prevention System):
├── 기능: 침입 탐지 및 실시간 차단
├── 위치: 네트워크 인라인
├── 동작: 액티브 차단
├── 응답: 실시간 트래픽 차단
└── 단점: 네트워크 지연 가능성
```

### Snort 기반 IDS 구성
```bash
# Snort 설정 파일 예시 (/etc/snort/snort.conf)

# 네트워크 변수 설정
var HOME_NET 192.168.1.0/24
var EXTERNAL_NET !$HOME_NET
var DMZ_NET 10.0.1.0/24

# 포트 변수 설정
var HTTP_PORTS [80,8080,8000:8999]
var HTTPS_PORTS [443,8443]
var SSH_PORTS 22

# 룰 파일 포함
include $RULE_PATH/local.rules
include $RULE_PATH/web-attacks.rules
include $RULE_PATH/dos.rules

# 출력 플러그인 설정
output alert_syslog: LOG_AUTH LOG_ALERT
output database: log, mysql, user=snort password=password dbname=snort host=localhost
```

### 커스텀 Snort 룰 작성
```bash
# /etc/snort/rules/local.rules

# SQL Injection 탐지
alert tcp $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (msg:"SQL Injection Attempt"; content:"union"; nocase; content:"select"; nocase; sid:1000001; rev:1;)

# XSS 공격 탐지  
alert tcp $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (msg:"XSS Attack Detected"; content:"<script"; nocase; sid:1000002; rev:1;)

# 브루트 포스 공격 탐지
alert tcp $EXTERNAL_NET any -> $HOME_NET $SSH_PORTS (msg:"SSH Brute Force Attack"; flags:S; threshold:type both, track by_src, count 5, seconds 60; sid:1000003; rev:1;)

# 포트 스캔 탐지
alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"Port Scan Detected"; flags:S; threshold:type threshold, track by_src, count 10, seconds 5; sid:1000004; rev:1;)

# DDoS 공격 탐지
alert tcp $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (msg:"Possible DDoS Attack"; flags:S; threshold:type both, track by_src, count 100, seconds 10; sid:1000005; rev:1;)
```

## 실무 면접 예상 질문

### 네트워크 보안 위협 질문
1. **"DDoS 공격을 받고 있을 때 어떤 순서로 대응하시겠습니까?"**
   - 트래픽 분석 및 공격 유형 파악
   - 방화벽/라우터 설정으로 차단
   - CDN/DDoS 방어 서비스 활용

2. **"ARP Spoofing 공격을 어떻게 탐지하고 방어하시겠습니까?"**
   - ARP 테이블 모니터링
   - Static ARP 엔트리 설정
   - 스위치 포트 보안 활용

### 웹 보안 질문
1. **"SQL Injection을 방어하는 방법들을 설명해주세요"**
   - Prepared Statement 사용
   - 입력값 검증 및 sanitization
   - 최소 권한 DB 계정 사용

2. **"XSS 공격의 유형과 각각의 방어 방법은?"**
   - Stored XSS, Reflected XSS, DOM-based XSS
   - 입력값 인코딩, CSP 헤더, 출력 필터링

### KISA 교육 경험 어필 포인트
- **실습 중심 학습**: Wireshark, Scapy 등 도구 활용
- **공격 시뮬레이션**: 안전한 환경에서 공격 기법 이해
- **방어 전략**: 다층 보안 방어 체계 구축
- **보안 도구**: IDS/IPS, 방화벽 설정 및 운영
- **윤리적 해킹**: 정보보호 전문가 윤리 의식
