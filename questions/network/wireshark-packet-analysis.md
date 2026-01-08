---
question: "⭐ Wireshark를 활용한 패킷 분석 방법과 네트워크 트러블슈팅 시 패킷 캡처를 통해 문제를 진단하는 과정을 설명해주세요."
shortAnswer: "Wireshark는 네트워크 패킷을 실시간으로 캡처하고 분석하는 도구로, 필터링(tcp.port==80), 프로토콜 분석, 플로우 추적을 통해 네트워크 문제를 진단합니다. TCP 3-way handshake, HTTP 요청/응답, DNS 조회 등을 시각적으로 분석할 수 있습니다."
---

# Wireshark 패킷 분석

## Wireshark 기본 개념

### 패킷 캡처 원리
```
네트워크 인터페이스 → 패킷 캡처 → 프로토콜 분석 → 시각화

캡처 모드:
├── Promiscuous Mode: 모든 패킷 캡처
├── Monitor Mode: 무선 네트워크 모니터링
└── Normal Mode: 해당 호스트 패킷만 캡처
```

### 주요 기능
```bash
# Wireshark 주요 구성 요소
패킷 리스트 창:
- 캡처된 패킷들의 목록
- 시간, 소스, 목적지, 프로토콜, 길이 정보

패킷 상세 창:
- 선택된 패킷의 프로토콜 계층별 상세 정보
- 헤더 필드별 분석

패킷 바이트 창:
- 패킷의 원시 데이터 (16진수/ASCII)
- 실제 바이트 레벨 분석
```

## 필터링 기법

### 기본 필터 문법
```bash
# 프로토콜 필터
tcp                    # TCP 패킷만
udp                    # UDP 패킷만
http                   # HTTP 패킷만
dns                    # DNS 패킷만
icmp                   # ICMP 패킷만

# IP 주소 필터
ip.src == 192.168.1.100        # 소스 IP
ip.dst == 192.168.1.200        # 목적지 IP
ip.addr == 192.168.1.0/24      # 특정 네트워크

# 포트 필터
tcp.port == 80                 # TCP 포트 80
udp.port == 53                 # UDP 포트 53
tcp.srcport == 443             # 소스 포트 443
tcp.dstport == 22              # 목적지 포트 22

# 복합 필터
tcp.port == 80 and ip.src == 192.168.1.100
http.request.method == "GET"
tcp.flags.syn == 1 and tcp.flags.ack == 0
```

### 고급 필터링
```bash
# HTTP 관련 필터
http.request                   # HTTP 요청만
http.response                  # HTTP 응답만
http.response.code == 404      # 404 에러만
http.host contains "google"    # 특정 호스트

# TCP 상태 필터
tcp.flags.syn == 1             # SYN 패킷
tcp.flags.fin == 1             # FIN 패킷
tcp.flags.rst == 1             # RST 패킷
tcp.analysis.retransmission    # 재전송 패킷

# 시간 기반 필터
frame.time >= "2024-01-01 00:00:00"
frame.time_delta > 1           # 1초 이상 지연

# 패킷 크기 필터
frame.len > 1000               # 1000바이트 이상
tcp.len == 0                   # TCP 페이로드 없음
```

## 프로토콜 분석

### TCP 연결 분석
```python
# TCP 3-way Handshake 분석 예시
"""
Wireshark에서 TCP 연결 설정 과정 분석:

1. SYN 패킷 (클라이언트 → 서버)
   - Flags: SYN=1, ACK=0
   - Seq: 0 (상대값)
   - 윈도우 크기, MSS 옵션 확인

2. SYN-ACK 패킷 (서버 → 클라이언트)
   - Flags: SYN=1, ACK=1
   - Seq: 0, Ack: 1
   - 서버의 윈도우 크기, MSS 확인

3. ACK 패킷 (클라이언트 → 서버)
   - Flags: SYN=0, ACK=1
   - Seq: 1, Ack: 1
   - 연결 설정 완료
"""

def analyze_tcp_handshake(pcap_file):
    """TCP 핸드셰이크 분석"""
    import pyshark
    
    cap = pyshark.FileCapture(pcap_file, display_filter='tcp.flags.syn==1')
    
    connections = {}
    
    for packet in cap:
        if hasattr(packet, 'tcp'):
            src_ip = packet.ip.src
            dst_ip = packet.ip.dst
            src_port = packet.tcp.srcport
            dst_port = packet.tcp.dstport
            
            connection_id = f"{src_ip}:{src_port}->{dst_ip}:{dst_port}"
            
            if connection_id not in connections:
                connections[connection_id] = {
                    'syn_time': packet.sniff_time,
                    'syn_seq': packet.tcp.seq,
                    'handshake_complete': False
                }
            
            # SYN-ACK 확인
            if packet.tcp.flags_syn == '1' and packet.tcp.flags_ack == '1':
                connections[connection_id]['syn_ack_time'] = packet.sniff_time
                connections[connection_id]['syn_ack_seq'] = packet.tcp.seq
                connections[connection_id]['syn_ack_ack'] = packet.tcp.ack
            
            # 최종 ACK 확인
            elif packet.tcp.flags_syn == '0' and packet.tcp.flags_ack == '1':
                connections[connection_id]['final_ack_time'] = packet.sniff_time
                connections[connection_id]['handshake_complete'] = True
    
    return connections
```

### HTTP 트래픽 분석
```python
# HTTP 요청/응답 분석
def analyze_http_traffic(pcap_file):
    """HTTP 트래픽 분석"""
    import pyshark
    
    cap = pyshark.FileCapture(pcap_file, display_filter='http')
    
    http_sessions = []
    
    for packet in cap:
        if hasattr(packet, 'http'):
            session_info = {
                'timestamp': packet.sniff_time,
                'src_ip': packet.ip.src,
                'dst_ip': packet.ip.dst,
                'method': getattr(packet.http, 'request_method', None),
                'uri': getattr(packet.http, 'request_uri', None),
                'host': getattr(packet.http, 'host', None),
                'user_agent': getattr(packet.http, 'user_agent', None),
                'response_code': getattr(packet.http, 'response_code', None),
                'content_type': getattr(packet.http, 'content_type', None),
                'content_length': getattr(packet.http, 'content_length', None)
            }
            
            http_sessions.append(session_info)
    
    return http_sessions

# 사용 예시
sessions = analyze_http_traffic('web_traffic.pcap')
for session in sessions[:5]:  # 상위 5개 세션 출력
    if session['method']:  # HTTP 요청
        print(f"요청: {session['method']} {session['uri']} - {session['host']}")
    elif session['response_code']:  # HTTP 응답
        print(f"응답: {session['response_code']} - {session['content_type']}")
```

### DNS 쿼리 분석
```python
# DNS 트래픽 분석
def analyze_dns_traffic(pcap_file):
    """DNS 쿼리 및 응답 분석"""
    import pyshark
    
    cap = pyshark.FileCapture(pcap_file, display_filter='dns')
    
    dns_queries = []
    
    for packet in cap:
        if hasattr(packet, 'dns'):
            dns_info = {
                'timestamp': packet.sniff_time,
                'src_ip': packet.ip.src,
                'dst_ip': packet.ip.dst,
                'transaction_id': packet.dns.id,
                'query_name': getattr(packet.dns, 'qry_name', None),
                'query_type': getattr(packet.dns, 'qry_type', None),
                'response_code': getattr(packet.dns, 'rcode', None),
                'answer_count': getattr(packet.dns, 'count_answers', 0),
                'answers': []
            }
            
            # DNS 응답의 경우 답변 추출
            if hasattr(packet.dns, 'a'):
                dns_info['answers'].append({
                    'type': 'A',
                    'address': packet.dns.a
                })
            
            if hasattr(packet.dns, 'cname'):
                dns_info['answers'].append({
                    'type': 'CNAME',
                    'name': packet.dns.cname
                })
            
            dns_queries.append(dns_info)
    
    return dns_queries
```

## 네트워크 문제 진단

### 성능 문제 분석
```python
# 네트워크 성능 분석
class NetworkPerformanceAnalyzer:
    def __init__(self, pcap_file):
        self.pcap_file = pcap_file
        self.analysis_results = {}
    
    def analyze_latency(self):
        """지연시간 분석"""
        import pyshark
        
        cap = pyshark.FileCapture(self.pcap_file, display_filter='tcp')
        
        connection_times = {}
        
        for packet in cap:
            if hasattr(packet, 'tcp'):
                src_ip = packet.ip.src
                dst_ip = packet.ip.dst
                
                connection_key = f"{src_ip}-{dst_ip}"
                
                # SYN 패킷 시간 기록
                if packet.tcp.flags_syn == '1' and packet.tcp.flags_ack == '0':
                    connection_times[connection_key] = {
                        'syn_time': float(packet.sniff_timestamp)
                    }
                
                # SYN-ACK 패킷으로 RTT 계산
                elif packet.tcp.flags_syn == '1' and packet.tcp.flags_ack == '1':
                    reverse_key = f"{dst_ip}-{src_ip}"
                    if reverse_key in connection_times:
                        syn_time = connection_times[reverse_key]['syn_time']
                        syn_ack_time = float(packet.sniff_timestamp)
                        rtt = (syn_ack_time - syn_time) * 1000  # ms
                        
                        connection_times[reverse_key]['rtt'] = rtt
        
        # RTT 통계
        rtts = [conn['rtt'] for conn in connection_times.values() if 'rtt' in conn]
        
        if rtts:
            self.analysis_results['latency'] = {
                'min_rtt': min(rtts),
                'max_rtt': max(rtts),
                'avg_rtt': sum(rtts) / len(rtts),
                'total_connections': len(rtts)
            }
        
        return self.analysis_results['latency']
    
    def analyze_throughput(self):
        """처리량 분석"""
        import pyshark
        from collections import defaultdict
        
        cap = pyshark.FileCapture(self.pcap_file)
        
        time_buckets = defaultdict(int)  # 초당 바이트 수
        
        for packet in cap:
            timestamp = int(float(packet.sniff_timestamp))
            packet_size = int(packet.length)
            time_buckets[timestamp] += packet_size
        
        if time_buckets:
            throughputs = list(time_buckets.values())
            
            self.analysis_results['throughput'] = {
                'max_throughput': max(throughputs),
                'min_throughput': min(throughputs),
                'avg_throughput': sum(throughputs) / len(throughputs),
                'total_bytes': sum(throughputs)
            }
        
        return self.analysis_results['throughput']
    
    def detect_retransmissions(self):
        """재전송 패킷 탐지"""
        import pyshark
        
        cap = pyshark.FileCapture(self.pcap_file, display_filter='tcp.analysis.retransmission')
        
        retransmissions = []
        
        for packet in cap:
            retransmission_info = {
                'timestamp': packet.sniff_time,
                'src_ip': packet.ip.src,
                'dst_ip': packet.ip.dst,
                'src_port': packet.tcp.srcport,
                'dst_port': packet.tcp.dstport,
                'seq_num': packet.tcp.seq
            }
            retransmissions.append(retransmission_info)
        
        self.analysis_results['retransmissions'] = {
            'count': len(retransmissions),
            'details': retransmissions
        }
        
        return self.analysis_results['retransmissions']

# 사용 예시
analyzer = NetworkPerformanceAnalyzer('network_traffic.pcap')

latency_results = analyzer.analyze_latency()
print(f"평균 RTT: {latency_results['avg_rtt']:.2f}ms")

throughput_results = analyzer.analyze_throughput()
print(f"평균 처리량: {throughput_results['avg_throughput']/1024:.2f} KB/s")

retransmission_results = analyzer.detect_retransmissions()
print(f"재전송 패킷 수: {retransmission_results['count']}")
```

## 보안 분석

### 의심스러운 트래픽 탐지
```python
# 보안 위협 탐지
class SecurityAnalyzer:
    def __init__(self, pcap_file):
        self.pcap_file = pcap_file
        self.threats = []
    
    def detect_port_scan(self):
        """포트 스캔 탐지"""
        import pyshark
        from collections import defaultdict
        
        cap = pyshark.FileCapture(self.pcap_file, display_filter='tcp.flags.syn==1 and tcp.flags.ack==0')
        
        scan_attempts = defaultdict(set)
        
        for packet in cap:
            src_ip = packet.ip.src
            dst_port = packet.tcp.dstport
            
            scan_attempts[src_ip].add(dst_port)
        
        # 10개 이상의 다른 포트에 접근한 IP를 스캔으로 판단
        for src_ip, ports in scan_attempts.items():
            if len(ports) >= 10:
                self.threats.append({
                    'type': 'PORT_SCAN',
                    'source_ip': src_ip,
                    'scanned_ports': list(ports),
                    'severity': 'HIGH'
                })
        
        return [t for t in self.threats if t['type'] == 'PORT_SCAN']
    
    def detect_dos_attack(self):
        """DoS 공격 탐지"""
        import pyshark
        from collections import defaultdict
        
        cap = pyshark.FileCapture(self.pcap_file)
        
        packet_counts = defaultdict(int)
        time_window = 60  # 1분 단위
        
        for packet in cap:
            src_ip = packet.ip.src
            timestamp = int(float(packet.sniff_timestamp) / time_window) * time_window
            
            packet_counts[(src_ip, timestamp)] += 1
        
        # 1분에 1000개 이상 패킷을 보낸 IP를 DoS로 판단
        for (src_ip, timestamp), count in packet_counts.items():
            if count >= 1000:
                self.threats.append({
                    'type': 'DOS_ATTACK',
                    'source_ip': src_ip,
                    'timestamp': timestamp,
                    'packet_count': count,
                    'severity': 'CRITICAL'
                })
        
        return [t for t in self.threats if t['type'] == 'DOS_ATTACK']
    
    def detect_suspicious_dns(self):
        """의심스러운 DNS 쿼리 탐지"""
        import pyshark
        
        cap = pyshark.FileCapture(self.pcap_file, display_filter='dns')
        
        suspicious_domains = [
            'malware.com', 'phishing.net', 'botnet.org'
        ]
        
        for packet in cap:
            if hasattr(packet.dns, 'qry_name'):
                query_name = packet.dns.qry_name.lower()
                
                for suspicious_domain in suspicious_domains:
                    if suspicious_domain in query_name:
                        self.threats.append({
                            'type': 'SUSPICIOUS_DNS',
                            'source_ip': packet.ip.src,
                            'query_name': query_name,
                            'timestamp': packet.sniff_time,
                            'severity': 'HIGH'
                        })
        
        return [t for t in self.threats if t['type'] == 'SUSPICIOUS_DNS']

# 사용 예시
security_analyzer = SecurityAnalyzer('suspicious_traffic.pcap')

port_scans = security_analyzer.detect_port_scan()
print(f"포트 스캔 탐지: {len(port_scans)}건")

dos_attacks = security_analyzer.detect_dos_attack()
print(f"DoS 공격 탐지: {len(dos_attacks)}건")

suspicious_dns = security_analyzer.detect_suspicious_dns()
print(f"의심스러운 DNS 쿼리: {len(suspicious_dns)}건")
```

## 실무 트러블슈팅 시나리오

### 웹 서비스 응답 지연 분석
```bash
# Wireshark 필터를 이용한 웹 서비스 분석

1. HTTP 응답 시간 분석:
   http.time > 5  # 5초 이상 응답 시간

2. TCP 재전송 확인:
   tcp.analysis.retransmission

3. TCP 윈도우 크기 문제:
   tcp.window_size_value < 1024

4. DNS 조회 시간:
   dns.time > 1  # 1초 이상 DNS 응답

5. SSL/TLS 핸드셰이크 분석:
   ssl.handshake.type == 1  # Client Hello
   ssl.handshake.type == 2  # Server Hello
```

### 네트워크 연결 문제 진단
```python
# 연결 실패 원인 분석
def diagnose_connection_failure(pcap_file, target_ip, target_port):
    """연결 실패 원인 진단"""
    import pyshark
    
    cap = pyshark.FileCapture(pcap_file, 
                             display_filter=f'ip.dst=={target_ip} and tcp.dstport=={target_port}')
    
    diagnosis = {
        'syn_sent': False,
        'syn_ack_received': False,
        'rst_received': False,
        'timeout': False,
        'connection_established': False
    }
    
    for packet in cap:
        if hasattr(packet, 'tcp'):
            # SYN 패킷 확인
            if packet.tcp.flags_syn == '1' and packet.tcp.flags_ack == '0':
                diagnosis['syn_sent'] = True
            
            # SYN-ACK 패킷 확인
            elif packet.tcp.flags_syn == '1' and packet.tcp.flags_ack == '1':
                diagnosis['syn_ack_received'] = True
            
            # RST 패킷 확인
            elif packet.tcp.flags_rst == '1':
                diagnosis['rst_received'] = True
            
            # 연결 설정 완료 확인
            elif packet.tcp.flags_syn == '0' and packet.tcp.flags_ack == '1':
                diagnosis['connection_established'] = True
    
    # 진단 결과 해석
    if not diagnosis['syn_sent']:
        return "클라이언트에서 연결 시도를 하지 않음"
    elif diagnosis['rst_received']:
        return "서버에서 연결을 거부함 (포트가 닫혀있음)"
    elif not diagnosis['syn_ack_received']:
        return "서버 응답 없음 (방화벽 차단 또는 서버 다운)"
    elif not diagnosis['connection_established']:
        return "핸드셰이크 미완료 (네트워크 문제)"
    else:
        return "연결 정상 설정됨"
```

## 실무 면접 예상 질문

### Wireshark 기본 사용법
1. **"Wireshark에서 특정 IP 간의 HTTP 트래픽만 보려면 어떤 필터를 사용하나요?"**
   - `http and ip.addr == 192.168.1.100`
   - `tcp.port == 80 and ip.src == 192.168.1.100`

2. **"TCP 재전송 패킷을 찾는 방법은?"**
   - `tcp.analysis.retransmission`
   - Statistics → TCP Stream Graphs

### 네트워크 문제 진단
1. **"웹 사이트 접속이 느릴 때 Wireshark로 어떻게 원인을 찾나요?"**
   - DNS 조회 시간 확인
   - TCP 핸드셰이크 지연 분석
   - HTTP 응답 시간 측정

2. **"패킷 캡처에서 보안 공격을 어떻게 탐지하나요?"**
   - 포트 스캔: 다수 포트로의 SYN 패킷
   - DoS 공격: 비정상적으로 많은 패킷
   - 의심스러운 프로토콜이나 포트 사용

### KISA 교육 경험 어필 포인트
- **실습 경험**: Wireshark를 이용한 실제 패킷 분석
- **프로토콜 이해**: TCP/IP 4계층 구조와 동작 원리
- **보안 관점**: 네트워크 트래픽에서 위협 탐지
- **문제 해결**: 체계적인 네트워크 문제 진단 능력
- **도구 활용**: 전문적인 네트워크 분석 도구 사용 경험

### 실무 시나리오 질문
1. **"사용자가 특정 웹사이트에 접속할 수 없다고 할 때 어떻게 분석하시겠습니까?"**
2. **"네트워크가 느리다는 신고가 들어왔을 때 패킷 분석으로 어떻게 원인을 찾나요?"**
3. **"DDoS 공격이 의심될 때 Wireshark로 어떤 패턴을 확인하시겠습니까?"**
