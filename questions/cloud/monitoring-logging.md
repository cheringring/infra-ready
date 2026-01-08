---
question: "클라우드 환경에서 모니터링과 로깅 시스템을 구축하는 방법과 주요 도구들(CloudWatch, ELK Stack, Prometheus)에 대해 설명해주세요."
shortAnswer: "CloudWatch로 AWS 리소스 모니터링, ELK Stack으로 로그 수집/분석, Prometheus+Grafana로 메트릭 수집/시각화를 구축하여 시스템 상태를 실시간으로 모니터링하고 장애를 예방할 수 있습니다."
---

# 클라우드 모니터링 및 로깅 시스템

## AWS CloudWatch

### 기본 개념
- **정의**: AWS 리소스 및 애플리케이션 모니터링 서비스
- **메트릭**: CPU, 메모리, 디스크, 네트워크 사용률 등
- **알람**: 임계값 초과 시 자동 알림

### 주요 기능
```bash
# CloudWatch 메트릭 조회
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average
```

### CloudWatch Logs
- **로그 그룹**: 애플리케이션별 로그 분류
- **로그 스트림**: 개별 인스턴스/컨테이너 로그
- **필터**: 특정 패턴 로그 검색

### 알람 설정 예시
```bash
# CPU 사용률 80% 초과 시 알람
aws cloudwatch put-metric-alarm \
  --alarm-name "High-CPU-Usage" \
  --alarm-description "CPU usage exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## ELK Stack (Elasticsearch, Logstash, Kibana)

### 구성 요소
- **Elasticsearch**: 로그 데이터 저장 및 검색 엔진
- **Logstash**: 로그 수집 및 변환 파이프라인
- **Kibana**: 데이터 시각화 및 대시보드
- **Beats**: 경량 데이터 수집기

### Logstash 설정 예시
```ruby
# /etc/logstash/conf.d/apache.conf
input {
  file {
    path => "/var/log/apache2/access.log"
    start_position => "beginning"
  }
}

filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
  }
  date {
    match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "apache-logs-%{+YYYY.MM.dd}"
  }
}
```

### Kibana 대시보드 활용
- **로그 검색**: 시간 범위, 필터 조건으로 로그 검색
- **시각화**: 차트, 그래프로 데이터 표현
- **대시보드**: 여러 시각화를 조합한 종합 화면

## Prometheus + Grafana

### Prometheus 특징
- **Pull 방식**: 타겟에서 메트릭을 주기적으로 수집
- **시계열 데이터**: 시간 기반 메트릭 저장
- **PromQL**: 강력한 쿼리 언어

### 설정 예시
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
```

### Grafana 대시보드
- **데이터 소스**: Prometheus, CloudWatch, InfluxDB 등
- **패널**: 그래프, 테이블, 게이지 등 다양한 시각화
- **알림**: 임계값 기반 알림 설정

### PromQL 쿼리 예시
```promql
# CPU 사용률
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 메모리 사용률
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 디스크 사용률
100 - ((node_filesystem_avail_bytes * 100) / node_filesystem_size_bytes)
```

## 로그 관리 전략

### 로그 레벨 관리
```bash
# 애플리케이션 로그 레벨
ERROR   - 오류 상황
WARN    - 경고 상황
INFO    - 일반 정보
DEBUG   - 디버깅 정보
```

### 로그 로테이션
```bash
# logrotate 설정 (/etc/logrotate.d/myapp)
/var/log/myapp/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
}
```

### 구조화된 로그 (JSON)
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "service": "web-api",
  "message": "User login successful",
  "user_id": "12345",
  "ip_address": "192.168.1.100",
  "response_time": 150
}
```

## 실무 모니터링 시나리오

### 1. 웹 애플리케이션 모니터링
```bash
# 핵심 메트릭
- 응답 시간 (Response Time)
- 처리량 (Throughput)
- 오류율 (Error Rate)
- 가용성 (Availability)
```

### 2. 인프라 모니터링
```bash
# 시스템 메트릭
- CPU 사용률
- 메모리 사용률
- 디스크 I/O
- 네트워크 트래픽
```

### 3. 데이터베이스 모니터링
```sql
-- MySQL 성능 메트릭
SHOW GLOBAL STATUS LIKE 'Threads_connected';
SHOW GLOBAL STATUS LIKE 'Slow_queries';
SHOW GLOBAL STATUS LIKE 'Questions';
```

## 알림 및 대응 체계

### 알림 채널 설정
- **이메일**: 중요도 낮은 알림
- **SMS**: 긴급 알림
- **Slack/Teams**: 팀 협업용 알림
- **PagerDuty**: 24/7 온콜 시스템

### 알림 규칙 예시
```yaml
# Prometheus Alertmanager 규칙
groups:
- name: system
  rules:
  - alert: HighCPUUsage
    expr: cpu_usage_percent > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is above 80% for more than 5 minutes"
```

### 에스컬레이션 정책
1. **1차 알림**: 담당 엔지니어
2. **2차 알림** (15분 후): 팀 리더
3. **3차 알림** (30분 후): 매니저

## 성능 최적화

### 메트릭 수집 최적화
- **샘플링**: 모든 요청이 아닌 일부만 수집
- **배치 처리**: 메트릭을 모아서 한 번에 전송
- **압축**: 데이터 전송 시 압축 사용

### 로그 저장 최적화
- **인덱싱**: 검색 성능 향상을 위한 적절한 인덱스
- **파티셔닝**: 시간 기반 데이터 분할
- **보존 정책**: 오래된 데이터 자동 삭제

## 보안 고려사항

### 로그 보안
- **민감 정보 마스킹**: 개인정보, 패스워드 등
- **접근 제어**: 로그 접근 권한 관리
- **암호화**: 로그 전송 및 저장 시 암호화

### 모니터링 보안
```bash
# Prometheus 보안 설정
--web.enable-admin-api=false
--web.enable-lifecycle=false
--storage.tsdb.retention.time=30d
```

## 신입 면접 핵심 포인트

### 1. 모니터링의 중요성
- **장애 예방**: 문제 발생 전 미리 감지
- **성능 최적화**: 병목 지점 파악
- **용량 계획**: 리소스 사용 패턴 분석

### 2. 메트릭 vs 로그
- **메트릭**: 수치 데이터, 시계열 분석
- **로그**: 이벤트 데이터, 상세 분석

### 3. 실무 질문 대비
- "시스템이 느려졌다는 신고가 들어왔을 때 어떤 메트릭을 먼저 확인하나요?"
- "로그가 너무 많아서 저장 공간이 부족할 때 어떻게 해결하나요?"
- "새로운 서비스를 배포할 때 어떤 모니터링을 설정하나요?"

### 4. SLA/SLO 개념
- **SLA**: 서비스 수준 협약 (99.9% 가용성)
- **SLO**: 서비스 수준 목표 (응답시간 < 200ms)
- **SLI**: 서비스 수준 지표 (실제 측정값)
