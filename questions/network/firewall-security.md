---
question: "방화벽의 종류와 동작 원리, 그리고 iptables를 이용한 리눅스 방화벽 설정 방법을 설명해주세요."
shortAnswer: "방화벽은 패킷 필터링, 상태 추적, 애플리케이션 레벨로 나뉘며, iptables는 리눅스 커널의 netfilter를 이용해 INPUT/OUTPUT/FORWARD 체인에서 패킷을 필터링합니다."
---

# 방화벽과 네트워크 보안

## 방화벽 종류

### 1. 패킷 필터링 방화벽 (Packet Filtering)
- **동작 레벨**: 네트워크 계층 (Layer 3)
- **필터링 기준**: IP 주소, 포트 번호, 프로토콜
- **특징**: 빠른 처리, 단순한 규칙
- **한계**: 연결 상태 추적 불가

```bash
# 예시: 특정 IP에서 SSH 접근 허용
iptables -A INPUT -s 192.168.1.100 -p tcp --dport 22 -j ACCEPT
```

### 2. 상태 추적 방화벽 (Stateful Inspection)
- **동작 레벨**: 네트워크 + 전송 계층 (Layer 3-4)
- **특징**: 연결 상태 테이블 유지
- **장점**: 연결 기반 보안, 더 정교한 제어

```bash
# 예시: 기존 연결에 대한 응답 패킷 허용
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
```

### 3. 애플리케이션 레벨 방화벽 (Application Layer)
- **동작 레벨**: 애플리케이션 계층 (Layer 7)
- **특징**: 애플리케이션 프로토콜 분석
- **예시**: WAF (Web Application Firewall)

## iptables 기본 구조

### 테이블과 체인
```
Tables:
├── filter (기본 테이블)
│   ├── INPUT (들어오는 패킷)
│   ├── OUTPUT (나가는 패킷)
│   └── FORWARD (라우팅되는 패킷)
├── nat (주소 변환)
│   ├── PREROUTING
│   ├── OUTPUT
│   └── POSTROUTING
└── mangle (패킷 수정)
```

### 기본 명령어 구조
```bash
iptables -t [테이블] -[동작] [체인] [매치 조건] -j [타겟]
```

## iptables 실무 설정

### 기본 정책 설정
```bash
# 기본 정책을 DROP으로 설정 (보안 강화)
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 로컬 루프백 허용
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT
```

### 기본 서비스 허용
```bash
# SSH 접근 허용 (특정 IP에서만)
iptables -A INPUT -s 192.168.1.0/24 -p tcp --dport 22 -j ACCEPT

# HTTP/HTTPS 허용
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# DNS 허용
iptables -A INPUT -p udp --dport 53 -j ACCEPT
iptables -A INPUT -p tcp --dport 53 -j ACCEPT

# 기존 연결 유지
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
```

### 웹 서버 방화벽 설정 예시
```bash
#!/bin/bash
# 웹 서버용 iptables 설정

# 기존 규칙 초기화
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X

# 기본 정책 설정
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 로컬 루프백 허용
iptables -A INPUT -i lo -j ACCEPT

# 기존 연결 허용
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# SSH (관리자 IP에서만)
iptables -A INPUT -s 203.0.113.0/24 -p tcp --dport 22 -j ACCEPT

# HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# ICMP (ping) 허용
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# DDoS 방어 - 연결 수 제한
iptables -A INPUT -p tcp --dport 80 -m connlimit --connlimit-above 20 -j DROP

# 포트 스캔 방어
iptables -A INPUT -m recent --name portscan --rcheck --seconds 86400 -j DROP
iptables -A INPUT -m recent --name portscan --set -j LOG --log-prefix "Portscan:"
iptables -A INPUT -m recent --name portscan --set -j DROP

# 설정 저장
iptables-save > /etc/iptables/rules.v4
```

### NAT 설정 (공유기 기능)
```bash
# 내부 네트워크를 외부로 NAT
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -o eth0 -j MASQUERADE

# 포트 포워딩 (외부 8080 → 내부 80)
iptables -t nat -A PREROUTING -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.100:80
iptables -A FORWARD -p tcp -d 192.168.1.100 --dport 80 -j ACCEPT
```

## 고급 매칭 모듈

### 시간 기반 제어
```bash
# 업무 시간에만 SSH 허용 (월-금 9-18시)
iptables -A INPUT -p tcp --dport 22 -m time --timestart 09:00 --timestop 18:00 --weekdays Mon,Tue,Wed,Thu,Fri -j ACCEPT
```

### 속도 제한
```bash
# SSH 연결 시도 제한 (분당 3회)
iptables -A INPUT -p tcp --dport 22 -m limit --limit 3/min --limit-burst 3 -j ACCEPT
```

### 지리적 차단 (GeoIP)
```bash
# 특정 국가에서의 접근 차단
iptables -A INPUT -m geoip --src-cc CN,RU -j DROP
```

## 로깅과 모니터링

### 로그 설정
```bash
# 차단된 패킷 로그 기록
iptables -A INPUT -j LOG --log-prefix "DROPPED: " --log-level 4
iptables -A INPUT -j DROP

# 로그 파일 확인
tail -f /var/log/kern.log | grep DROPPED
```

### 통계 확인
```bash
# 규칙별 패킷 카운트 확인
iptables -L -n -v

# 특정 체인의 상세 정보
iptables -L INPUT -n -v --line-numbers
```

## 방화벽 우회 기법과 대응

### 일반적인 우회 기법
1. **포트 호핑**: 다양한 포트로 접근 시도
2. **프로토콜 터널링**: HTTP 터널을 통한 우회
3. **IP 스푸핑**: 허용된 IP로 위장

### 대응 방안
```bash
# SYN Flood 공격 방어
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT

# IP 스푸핑 방어 (Reverse Path Filtering)
echo 1 > /proc/sys/net/ipv4/conf/all/rp_filter

# ICMP Redirect 차단
echo 0 > /proc/sys/net/ipv4/conf/all/accept_redirects
```

## 방화벽 관리 도구

### UFW (Uncomplicated Firewall)
```bash
# UFW 활성화
ufw enable

# 기본 정책 설정
ufw default deny incoming
ufw default allow outgoing

# 서비스 허용
ufw allow ssh
ufw allow 'Apache Full'
ufw allow from 192.168.1.0/24 to any port 3306

# 상태 확인
ufw status verbose
```

### firewalld (CentOS/RHEL)
```bash
# 서비스 시작
systemctl start firewalld
systemctl enable firewalld

# 존 관리
firewall-cmd --get-default-zone
firewall-cmd --set-default-zone=public

# 서비스 허용
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# 포트 허용
firewall-cmd --permanent --add-port=8080/tcp
```

## 네트워크 보안 모범 사례

### 1. 최소 권한 원칙
```bash
# 필요한 포트만 열기
iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT  # SSH는 내부망만
iptables -A INPUT -p tcp --dport 80 -j ACCEPT                    # HTTP는 전체 허용
iptables -A INPUT -p tcp --dport 443 -j ACCEPT                   # HTTPS는 전체 허용
```

### 2. 정기적인 규칙 검토
```bash
# 사용되지 않는 규칙 확인
iptables -L -n -v | grep "0     0"

# 규칙 정리
iptables -D INPUT 5  # 5번째 규칙 삭제
```

### 3. 백업과 복구
```bash
# 현재 설정 백업
iptables-save > /root/iptables-backup-$(date +%Y%m%d).rules

# 설정 복구
iptables-restore < /root/iptables-backup-20240101.rules
```

## 실무 시나리오

### 1. 웹 서버 보안 강화
```bash
# HTTP에서 HTTPS로 리다이렉트
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 443

# 특정 국가 IP 차단
iptables -A INPUT -m geoip --src-cc CN,RU,KP -j DROP

# 브루트 포스 공격 방어
iptables -A INPUT -p tcp --dport 22 -m recent --name ssh --set
iptables -A INPUT -p tcp --dport 22 -m recent --name ssh --rcheck --seconds 60 --hitcount 4 -j DROP
```

### 2. 데이터베이스 서버 보안
```bash
# 데이터베이스는 애플리케이션 서버에서만 접근
iptables -A INPUT -p tcp --dport 3306 -s 192.168.1.10 -j ACCEPT  # App Server
iptables -A INPUT -p tcp --dport 3306 -j DROP                     # 나머지 차단
```

### 3. 로드 밸런서 설정
```bash
# 로드 밸런서에서 백엔드 서버로 트래픽 분산
iptables -t nat -A PREROUTING -p tcp --dport 80 -m statistic --mode nth --every 2 --packet 0 -j DNAT --to-destination 192.168.1.10:80
iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.1.11:80
```

## 신입 면접 핵심 포인트

### 1. 방화벽의 필요성
- **외부 위협 차단**: 해킹, DDoS 공격 방어
- **내부 보안**: 내부 네트워크 분할 및 접근 제어
- **규정 준수**: 보안 정책 및 법규 준수

### 2. 방화벽 설계 원칙
- **기본 거부**: 모든 트래픽을 기본적으로 차단
- **최소 권한**: 필요한 최소한의 접근만 허용
- **계층적 방어**: 여러 단계의 보안 장치

### 3. 실무 질문 대비
- "웹 서버에 방화벽을 설정한다면 어떤 포트를 열어야 하나요?"
- "SSH 브루트 포스 공격을 방어하는 방법은?"
- "내부 네트워크에서 외부로 나가는 트래픽도 제어해야 하나요?"

### 4. 문제 해결
- **연결 안 될 때**: 방화벽 규칙 확인
- **성능 저하**: 규칙 최적화 필요
- **로그 분석**: 공격 패턴 파악 및 대응
