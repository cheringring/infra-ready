---
question: "네트워크 장애 발생 시 체계적인 문제 해결 방법론과 주요 트러블슈팅 도구들, 그리고 실무에서 자주 발생하는 네트워크 문제 시나리오를 설명해주세요."
shortAnswer: "네트워크 트러블슈팅은 OSI 7계층 모델을 기반으로 물리계층부터 순차적으로 확인하며, ping, traceroute, wireshark 등의 도구를 활용합니다. 연결성, 성능, 보안 문제를 체계적으로 분석하여 해결합니다."
---

# 네트워크 트러블슈팅

## 트러블슈팅 방법론

### 1. 계층적 접근법 (OSI 7계층 기반)
```
Layer 7 (Application): 애플리케이션 오류
Layer 6 (Presentation): 암호화/압축 문제
Layer 5 (Session): 세션 연결 문제
Layer 4 (Transport): TCP/UDP 포트 문제
Layer 3 (Network): IP 라우팅 문제
Layer 2 (Data Link): 스위칭, VLAN 문제
Layer 1 (Physical): 케이블, 포트 문제
```

### 2. 분할 정복법 (Divide and Conquer)
```
문제 영역을 반으로 나누어 확인:

사용자 PC ←→ 스위치 ←→ 라우터 ←→ 인터넷 ←→ 서버

1. 중간 지점(라우터)에서 테스트
2. 문제가 있는 구간을 다시 반으로 나누어 테스트
3. 문제 지점을 정확히 찾을 때까지 반복
```

### 3. 상향식 접근법 (Bottom-Up)
```
물리 계층부터 시작:
1. 케이블 연결 상태 확인
2. 링크 상태 확인
3. IP 설정 확인
4. 라우팅 확인
5. 애플리케이션 확인
```

### 4. 하향식 접근법 (Top-Down)
```
애플리케이션부터 시작:
1. 애플리케이션 오류 확인
2. 포트 연결 상태 확인
3. IP 연결성 확인
4. 물리적 연결 확인
```

## 주요 트러블슈팅 도구

### 1. 기본 연결성 테스트

#### ping
```bash
# 기본 ping 테스트
ping 8.8.8.8

# 지속적인 ping
ping -t 192.168.1.1

# 패킷 크기 지정
ping -s 1472 192.168.1.1

# IPv6 ping
ping6 2001:4860:4860::8888

# ping 결과 분석
64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=15.2 ms
└─ TTL 값으로 홉 수 추정 (초기값 - 현재값)
└─ 응답 시간으로 지연 측정
```

#### traceroute/tracert
```bash
# Linux/Mac
traceroute google.com

# Windows
tracert google.com

# UDP 대신 ICMP 사용
traceroute -I google.com

# 결과 분석 예시
 1  192.168.1.1 (192.168.1.1)  1.234 ms  1.123 ms  1.456 ms
 2  10.0.0.1 (10.0.0.1)  5.678 ms  5.432 ms  5.789 ms
 3  * * *  (타임아웃 - 방화벽 또는 라우터 설정)
 4  203.0.113.1 (203.0.113.1)  15.234 ms  14.567 ms  15.123 ms
```

### 2. 네트워크 상태 확인

#### netstat
```bash
# 모든 연결 상태 확인
netstat -an

# 리스닝 포트만 확인
netstat -ln

# 특정 포트 확인
netstat -an | grep :80

# 프로세스 정보 포함
netstat -anp

# 라우팅 테이블 확인
netstat -rn
```

#### ss (Socket Statistics)
```bash
# netstat의 현대적 대안
ss -tuln

# 특정 포트 확인
ss -tlnp | grep :443

# 연결 통계
ss -s
```

#### nslookup/dig
```bash
# DNS 조회
nslookup google.com

# 특정 DNS 서버 사용
nslookup google.com 8.8.8.8

# dig 사용 (더 상세한 정보)
dig google.com

# 역방향 DNS 조회
dig -x 8.8.8.8

# 특정 레코드 타입 조회
dig google.com MX
dig google.com AAAA
```

### 3. 패킷 분석 도구

#### tcpdump
```bash
# 기본 패킷 캡처
tcpdump -i eth0

# 특정 호스트 트래픽
tcpdump host 192.168.1.100

# 특정 포트 트래픽
tcpdump port 80

# HTTP 트래픽만 캡처
tcpdump -i eth0 -A port 80

# 파일로 저장
tcpdump -i eth0 -w capture.pcap

# 저장된 파일 읽기
tcpdump -r capture.pcap
```

#### Wireshark
```bash
# 명령행 버전 (tshark)
tshark -i eth0 -f "host 192.168.1.100"

# 특정 프로토콜 필터
tshark -i eth0 -f "tcp port 443"

# 통계 정보
tshark -i eth0 -z conv,ip -q
```

### 4. 네트워크 성능 측정

#### iperf3
```bash
# 서버 모드
iperf3 -s

# 클라이언트 모드
iperf3 -c 192.168.1.100

# UDP 테스트
iperf3 -c 192.168.1.100 -u

# 대역폭 제한 테스트
iperf3 -c 192.168.1.100 -b 100M

# 병렬 연결 테스트
iperf3 -c 192.168.1.100 -P 4
```

#### mtr (My TraceRoute)
```bash
# 지속적인 traceroute + ping
mtr google.com

# 보고서 모드
mtr --report --report-cycles 100 google.com
```

## 실무 트러블슈팅 시나리오

### 시나리오 1: 인터넷 연결 안 됨

#### 문제 상황
```
사용자 신고: "인터넷이 안 됩니다"
증상: 웹 브라우저가 페이지를 로드하지 못함
```

#### 체계적 해결 과정
```bash
# 1단계: 로컬 네트워크 연결 확인
ping 127.0.0.1  # 로컬 루프백
ping 192.168.1.1  # 기본 게이트웨이

# 2단계: DNS 확인
nslookup google.com
ping 8.8.8.8  # DNS 서버 직접 ping

# 3단계: 외부 연결 확인
ping 8.8.8.8  # 구글 DNS
traceroute 8.8.8.8  # 경로 추적

# 4단계: 웹 서비스 확인
telnet google.com 80
curl -I http://google.com
```

#### 가능한 원인과 해결책
```
원인 1: IP 설정 문제
해결: DHCP 갱신 또는 고정 IP 재설정

원인 2: DNS 문제
해결: DNS 서버 변경 (8.8.8.8, 1.1.1.1)

원인 3: 방화벽 문제
해결: 방화벽 규칙 확인 및 수정

원인 4: 라우팅 문제
해결: 기본 게이트웨이 설정 확인
```

### 시나리오 2: 네트워크 성능 저하

#### 문제 상황
```
사용자 신고: "네트워크가 너무 느립니다"
증상: 파일 다운로드 속도 저하, 웹 페이지 로딩 지연
```

#### 성능 분석 과정
```bash
# 1단계: 대역폭 테스트
iperf3 -c speed-test-server

# 2단계: 지연시간 측정
ping -c 100 8.8.8.8
mtr --report --report-cycles 50 google.com

# 3단계: 패킷 손실 확인
ping -c 1000 192.168.1.1 | grep "packet loss"

# 4단계: 네트워크 사용률 확인
iftop -i eth0
nethogs  # 프로세스별 네트워크 사용량
```

#### 성능 문제 원인 분석
```python
# 네트워크 성능 분석 스크립트
import subprocess
import re
import time

def analyze_network_performance():
    results = {}
    
    # 1. Ping 지연시간 측정
    ping_result = subprocess.run(['ping', '-c', '10', '8.8.8.8'], 
                                capture_output=True, text=True)
    
    if ping_result.returncode == 0:
        # 평균 지연시간 추출
        avg_match = re.search(r'avg = ([\d.]+)', ping_result.stdout)
        if avg_match:
            results['avg_latency'] = float(avg_match.group(1))
    
    # 2. 패킷 손실률 측정
    loss_match = re.search(r'(\d+)% packet loss', ping_result.stdout)
    if loss_match:
        results['packet_loss'] = int(loss_match.group(1))
    
    # 3. 대역폭 테스트 (iperf3 필요)
    try:
        iperf_result = subprocess.run(['iperf3', '-c', 'iperf.he.net', '-t', '10'], 
                                     capture_output=True, text=True, timeout=30)
        
        if iperf_result.returncode == 0:
            # 대역폭 추출
            bw_match = re.search(r'(\d+\.?\d*)\s+Mbits/sec.*receiver', iperf_result.stdout)
            if bw_match:
                results['bandwidth_mbps'] = float(bw_match.group(1))
    except subprocess.TimeoutExpired:
        results['bandwidth_mbps'] = 'timeout'
    
    return results

# 성능 분석 실행
performance = analyze_network_performance()
print(f"평균 지연시간: {performance.get('avg_latency', 'N/A')} ms")
print(f"패킷 손실률: {performance.get('packet_loss', 'N/A')}%")
print(f"대역폭: {performance.get('bandwidth_mbps', 'N/A')} Mbps")
```

### 시나리오 3: VLAN 간 통신 문제

#### 문제 상황
```
증상: VLAN 10의 사용자가 VLAN 20의 서버에 접근 불가
네트워크 구성: L3 스위치를 통한 Inter-VLAN 라우팅
```

#### 문제 해결 과정
```bash
# 1단계: VLAN 설정 확인
show vlan brief
show interfaces trunk

# 2단계: SVI(Switched Virtual Interface) 확인
show ip interface brief
show ip interface vlan 10
show ip interface vlan 20

# 3단계: 라우팅 테이블 확인
show ip route
show ip route 192.168.20.0

# 4단계: ACL 확인
show access-lists
show ip access-lists

# 5단계: ARP 테이블 확인
show arp
```

#### 일반적인 원인과 해결책
```bash
# 원인 1: SVI 인터페이스 Down
L3Switch(config)# interface vlan 10
L3Switch(config-if)# no shutdown

# 원인 2: IP 라우팅 비활성화
L3Switch(config)# ip routing

# 원인 3: ACL 차단
L3Switch(config)# no ip access-group BLOCK_INTER_VLAN in

# 원인 4: VLAN 미설정
L3Switch(config)# vlan 10,20
L3Switch(config)# interface vlan 10
L3Switch(config-if)# ip address 192.168.10.1 255.255.255.0
```

### 시나리오 4: OSPF Neighbor 관계 형성 실패

#### 문제 상황
```
증상: OSPF neighbor가 형성되지 않음
결과: 라우팅 정보 교환 불가, 네트워크 분할
```

#### 진단 과정
```bash
# 1단계: OSPF neighbor 상태 확인
show ip ospf neighbor

# 2단계: OSPF 인터페이스 상태 확인
show ip ospf interface

# 3단계: OSPF 데이터베이스 확인
show ip ospf database

# 4단계: Hello 패킷 디버깅
debug ip ospf hello
debug ip ospf adj
```

#### 문제 해결 체크리스트
```bash
# 1. Area ID 일치 확인
Router1# show ip ospf interface gi0/0
Router2# show ip ospf interface gi0/1

# 2. Hello/Dead Timer 일치 확인
Router(config)# interface gi0/0
Router(config-if)# ip ospf hello-interval 10
Router(config-if)# ip ospf dead-interval 40

# 3. 네트워크 타입 일치 확인
Router(config-if)# ip ospf network broadcast

# 4. 인증 설정 일치 확인
Router(config-if)# ip ospf authentication message-digest
Router(config-if)# ip ospf message-digest-key 1 md5 password

# 5. MTU 크기 확인
Router(config-if)# ip mtu 1500
Router(config-if)# ip ospf mtu-ignore
```

## 네트워크 모니터링 및 예방

### 1. 지속적 모니터링
```bash
# SNMP 기반 모니터링 설정
Router(config)# snmp-server community public ro
Router(config)# snmp-server host 192.168.1.100 public
Router(config)# snmp-server enable traps

# Syslog 설정
Router(config)# logging host 192.168.1.200
Router(config)# logging trap warnings
```

### 2. 성능 임계값 설정
```python
# 네트워크 성능 모니터링 스크립트
import time
import subprocess
import smtplib
from email.mime.text import MIMEText

class NetworkMonitor:
    def __init__(self):
        self.thresholds = {
            'latency_ms': 100,
            'packet_loss_percent': 5,
            'bandwidth_mbps': 10
        }
    
    def check_latency(self, target='8.8.8.8'):
        result = subprocess.run(['ping', '-c', '5', target], 
                               capture_output=True, text=True)
        
        if result.returncode == 0:
            # 평균 지연시간 추출
            import re
            avg_match = re.search(r'avg = ([\d.]+)', result.stdout)
            if avg_match:
                latency = float(avg_match.group(1))
                if latency > self.thresholds['latency_ms']:
                    self.send_alert(f"High latency detected: {latency}ms")
                return latency
        return None
    
    def check_packet_loss(self, target='8.8.8.8'):
        result = subprocess.run(['ping', '-c', '100', target], 
                               capture_output=True, text=True)
        
        if result.returncode == 0:
            import re
            loss_match = re.search(r'(\d+)% packet loss', result.stdout)
            if loss_match:
                loss = int(loss_match.group(1))
                if loss > self.thresholds['packet_loss_percent']:
                    self.send_alert(f"High packet loss: {loss}%")
                return loss
        return None
    
    def send_alert(self, message):
        # 이메일 알림 발송
        msg = MIMEText(message)
        msg['Subject'] = 'Network Alert'
        msg['From'] = 'monitor@company.com'
        msg['To'] = 'admin@company.com'
        
        try:
            server = smtplib.SMTP('localhost')
            server.send_message(msg)
            server.quit()
        except Exception as e:
            print(f"Failed to send alert: {e}")
    
    def run_monitoring(self):
        while True:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Running network checks...")
            
            latency = self.check_latency()
            packet_loss = self.check_packet_loss()
            
            print(f"Latency: {latency}ms, Packet Loss: {packet_loss}%")
            
            time.sleep(300)  # 5분마다 체크

# 모니터링 실행
if __name__ == "__main__":
    monitor = NetworkMonitor()
    monitor.run_monitoring()
```

### 3. 자동화된 문제 해결
```bash
#!/bin/bash
# 네트워크 자동 복구 스크립트

LOG_FILE="/var/log/network_recovery.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_connectivity() {
    local target=$1
    ping -c 3 "$target" > /dev/null 2>&1
    return $?
}

restart_network_interface() {
    local interface=$1
    log_message "Restarting interface $interface"
    
    ifdown "$interface"
    sleep 2
    ifup "$interface"
    
    if check_connectivity "8.8.8.8"; then
        log_message "Interface $interface restart successful"
        return 0
    else
        log_message "Interface $interface restart failed"
        return 1
    fi
}

# 메인 복구 로직
main() {
    log_message "Starting network connectivity check"
    
    if ! check_connectivity "8.8.8.8"; then
        log_message "Internet connectivity lost, attempting recovery"
        
        # 1. 네트워크 인터페이스 재시작
        if restart_network_interface "eth0"; then
            log_message "Recovery successful via interface restart"
            exit 0
        fi
        
        # 2. DHCP 갱신
        log_message "Attempting DHCP renewal"
        dhclient -r eth0
        dhclient eth0
        
        if check_connectivity "8.8.8.8"; then
            log_message "Recovery successful via DHCP renewal"
            exit 0
        fi
        
        # 3. 관리자에게 알림
        log_message "Automatic recovery failed, notifying administrator"
        echo "Network connectivity issue requires manual intervention" | \
        mail -s "Network Alert" admin@company.com
        
    else
        log_message "Network connectivity OK"
    fi
}

main
```

## 골든시스 네트워크 챌린지 연관 면접 질문

### 실무 트러블슈팅 역량 평가
1. **"사용자가 특정 서버에 접근할 수 없다고 신고했을 때, 어떤 순서로 문제를 해결하시겠습니까?"**
   - 체계적 접근법 (OSI 계층별)
   - 사용할 도구들 (ping, traceroute, telnet)
   - 로그 분석 방법

2. **"VLAN 간 통신이 안 될 때 확인해야 할 사항들은?"**
   - Inter-VLAN 라우팅 설정
   - SVI 인터페이스 상태
   - ACL 정책 확인

3. **"네트워크 성능이 저하되었을 때 원인을 찾는 방법은?"**
   - 대역폭 측정 도구
   - 지연시간 분석
   - 패킷 손실률 확인

### 골든시스 경험 어필 포인트
- **실무 경험**: 실제 네트워크 장애 해결 경험
- **도구 활용**: 다양한 트러블슈팅 도구 사용 능력
- **체계적 접근**: 논리적이고 단계적인 문제 해결
- **예방적 관리**: 모니터링을 통한 사전 문제 발견
- **문서화**: 문제 해결 과정과 결과 기록

### 기술적 심화 질문
1. **"Wireshark를 이용해 네트워크 문제를 분석한 경험이 있나요?"**
2. **"OSPF 수렴 시간이 길어질 때 어떻게 최적화하시겠습니까?"**
3. **"네트워크 보안 사고 발생 시 초기 대응 방법은?"**
