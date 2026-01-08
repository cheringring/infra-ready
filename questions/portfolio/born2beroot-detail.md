---
question: "Born2beroot 프로젝트에서 UFW와 iptables의 차이점은 무엇이고, 왜 UFW를 선택했나요?"
shortAnswer: "UFW는 iptables의 프론트엔드로, 더 간단한 문법을 제공합니다. iptables는 강력하지만 복잡하고, UFW는 초보자도 쉽게 방화벽을 설정할 수 있어 선택했습니다. 실무에서는 복잡한 규칙이 필요하면 iptables를, 간단한 규칙이면 UFW를 사용합니다."
---

## 상세 답변

### UFW vs iptables

#### iptables
**특징**
- Linux 커널의 netfilter 프레임워크를 제어하는 도구
- 매우 강력하고 세밀한 제어 가능
- 복잡한 문법

**예시**
```bash
# iptables로 SSH 포트 허용
iptables -A INPUT -p tcp --dport 4242 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -j DROP

# 규칙 확인
iptables -L -n -v

# 규칙 저장
iptables-save > /etc/iptables/rules.v4
```

#### UFW (Uncomplicated Firewall)
**특징**
- iptables의 프론트엔드
- 간단한 문법
- 사용자 친화적

**예시**
```bash
# UFW로 SSH 포트 허용
ufw allow 4242/tcp
ufw allow 80/tcp
ufw default deny incoming
ufw default allow outgoing
ufw enable

# 규칙 확인
ufw status verbose
```

### Born2beroot에서의 선택

#### UFW를 선택한 이유

1. **학습 목적**
   - 방화벽 개념 이해에 집중
   - 복잡한 문법보다 원리 이해가 중요

2. **간단한 규칙**
   - SSH 포트만 허용하면 됨
   - 복잡한 NAT나 포트 포워딩 불필요

3. **유지보수**
   - 규칙 추가/삭제가 쉬움
   - 가독성 좋음

4. **과제 요구사항**
   - UFW 또는 firewalld 사용 권장

### 실제 구현

```bash
# 1. UFW 설치
sudo apt install ufw

# 2. 기본 정책 설정
sudo ufw default deny incoming   # 들어오는 연결 차단
sudo ufw default allow outgoing  # 나가는 연결 허용

# 3. SSH 포트 허용 (4242)
sudo ufw allow 4242/tcp

# 4. UFW 활성화
sudo ufw enable

# 5. 상태 확인
sudo ufw status numbered

# 출력:
# Status: active
# 
#      To                         Action      From
#      --                         ------      ----
# [ 1] 4242/tcp                   ALLOW IN    Anywhere
```

### 고급 UFW 사용법

#### 특정 IP만 허용
```bash
# 특정 IP에서만 SSH 접속 허용
sudo ufw allow from 192.168.1.100 to any port 4242

# 특정 서브넷 허용
sudo ufw allow from 192.168.1.0/24 to any port 4242
```

#### 애플리케이션 프로필
```bash
# 사용 가능한 프로필 확인
sudo ufw app list

# Nginx 허용
sudo ufw allow 'Nginx Full'

# OpenSSH 허용
sudo ufw allow 'OpenSSH'
```

#### 규칙 삭제
```bash
# 번호로 삭제
sudo ufw status numbered
sudo ufw delete 1

# 규칙으로 삭제
sudo ufw delete allow 4242/tcp
```

#### 로깅
```bash
# 로깅 활성화
sudo ufw logging on

# 로그 확인
sudo tail -f /var/log/ufw.log
```

### iptables 심화

#### 체인 (Chain)
```
INPUT: 들어오는 패킷
OUTPUT: 나가는 패킷
FORWARD: 라우팅되는 패킷
```

#### 테이블 (Table)
```
filter: 패킷 필터링 (기본)
nat: NAT (Network Address Translation)
mangle: 패킷 변조
raw: 연결 추적 예외
```

#### 복잡한 규칙 예시
```bash
# 특정 IP에서 SSH 접속 허용
iptables -A INPUT -p tcp -s 192.168.1.100 --dport 4242 -j ACCEPT

# 초당 5개 이상 연결 차단 (DDoS 방어)
iptables -A INPUT -p tcp --dport 80 -m limit --limit 5/s -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j DROP

# 로그 남기기
iptables -A INPUT -j LOG --log-prefix "DROPPED: "

# NAT (포트 포워딩)
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
```

### 실무 선택 기준

#### UFW를 사용하는 경우
- 간단한 서버 (웹 서버, DB 서버)
- 기본적인 방화벽 규칙만 필요
- 빠른 설정이 필요한 경우
- 팀원들의 Linux 경험이 적은 경우

**예시**: 개인 블로그, 소규모 웹 서비스

#### iptables를 사용하는 경우
- 복잡한 네트워크 구성
- NAT, 포트 포워딩 필요
- 세밀한 제어 필요
- 성능 최적화 필요

**예시**: 게이트웨이 서버, 로드 밸런서, VPN 서버

#### 클라우드 환경
- AWS: Security Group (iptables 기반)
- Azure: Network Security Group
- GCP: Firewall Rules

**장점**: 웹 콘솔에서 관리, 자동화 쉬움

### Born2beroot 추가 보안 설정

#### 1. Fail2ban (무차별 대입 공격 방어)
```bash
# 설치
sudo apt install fail2ban

# 설정
sudo vi /etc/fail2ban/jail.local

[sshd]
enabled = true
port = 4242
maxretry = 3
bantime = 600
findtime = 600

# 재시작
sudo systemctl restart fail2ban

# 상태 확인
sudo fail2ban-client status sshd
```

#### 2. 포트 스캔 탐지
```bash
# iptables로 포트 스캔 차단
iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP
```

#### 3. ICMP (Ping) 차단
```bash
# UFW
sudo ufw deny proto icmp

# iptables
iptables -A INPUT -p icmp -j DROP
```

### 모니터링

#### UFW 로그 분석
```bash
# 차단된 연결 확인
sudo grep "UFW BLOCK" /var/log/ufw.log

# 실시간 모니터링
sudo tail -f /var/log/ufw.log | grep "DPT=4242"
```

#### 연결 상태 확인
```bash
# 현재 연결 확인
sudo netstat -tuln

# 특정 포트 확인
sudo ss -tuln | grep 4242

# 연결 수 확인
sudo netstat -an | grep ESTABLISHED | wc -l
```

### 문제 해결

#### SSH 접속 안 될 때
```bash
# 1. UFW 상태 확인
sudo ufw status

# 2. 포트 열려있는지 확인
sudo netstat -tuln | grep 4242

# 3. SSH 서비스 상태
sudo systemctl status ssh

# 4. 임시로 UFW 비활성화 (테스트용)
sudo ufw disable

# 5. 로그 확인
sudo tail -f /var/log/auth.log
```

#### 규칙 충돌
```bash
# UFW와 iptables 동시 사용 시 문제
# UFW는 iptables를 사용하므로 직접 iptables 수정하면 충돌

# 해결: UFW만 사용하거나 iptables만 사용
```

### 실무 팁

1. **방화벽 설정 전 백업**
```bash
# iptables 백업
sudo iptables-save > /root/iptables-backup.rules

# UFW 백업
sudo cp -r /etc/ufw /root/ufw-backup
```

2. **테스트 환경에서 먼저 테스트**
```bash
# 잘못된 규칙으로 SSH 차단되면 서버 접속 불가!
# 항상 콘솔 접근 가능한 상태에서 테스트
```

3. **자동화**
```bash
# Ansible로 방화벽 설정 자동화
- name: Configure UFW
  ufw:
    rule: allow
    port: 4242
    proto: tcp
```

### 면접 답변 예시

**질문**: "UFW와 iptables의 차이점은?"

**답변**:
"UFW는 iptables의 프론트엔드로, 더 간단한 문법을 제공합니다. iptables는 `iptables -A INPUT -p tcp --dport 4242 -j ACCEPT`처럼 복잡하지만, UFW는 `ufw allow 4242/tcp`로 간단합니다. Born2beroot 프로젝트에서는 SSH 포트만 허용하면 되는 간단한 규칙이었기 때문에 UFW를 선택했습니다. 실무에서는 NAT나 복잡한 라우팅이 필요하면 iptables를, 기본적인 방화벽이면 UFW를 사용합니다. 클라우드 환경에서는 AWS Security Group 같은 관리형 방화벽을 주로 사용합니다."

**추가 질문 대비**:
- "Fail2ban은 무엇인가요?"
- "DDoS 공격을 방화벽으로 어떻게 막나요?"
- "클라우드에서는 방화벽을 어떻게 설정하나요?"
