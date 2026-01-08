---
question: "네이버 클라우드 플랫폼(NCP)의 보안 모델과 IAM, ACG, Network ACL을 활용한 다중 레이어 보안 구성 방법을 설명해주세요."
shortAnswer: "NCP는 계정 관리(Sub Account), 리소스 접근 제어(ACG), 네트워크 레벨 보안(Network ACL)으로 구성된 다중 보안 계층을 제공합니다. VPC 환경에서 서브넷 분리와 최소 권한 원칙을 적용하여 보안을 강화할 수 있습니다."
---

# 네이버 클라우드 플랫폼(NCP) 보안 전문가

## NCP 보안 모델 개요

### 클라우드 보안 책임 분담 모델
```
NCP 책임 영역:
├── 물리적 보안 (데이터센터, 하드웨어)
├── 네트워크 인프라 보안
├── 하이퍼바이저 보안
└── 관리형 서비스 보안

고객 책임 영역:
├── 게스트 OS 보안
├── 애플리케이션 보안
├── 데이터 암호화
├── 네트워크 트래픽 보호
└── IAM 정책 관리
```

### NCP 보안 서비스 구성
```
보안 계층:
├── 계정 관리 (Sub Account, MFA)
├── 접근 제어 (ACG, Network ACL)
├── 네트워크 보안 (VPC, NAT Gateway)
├── 데이터 보안 (KMS, SSL 인증서)
├── 모니터링 (Cloud Activity Tracer, Security Monitoring)
└── 컴플라이언스 (ISMS-P, ISO 27001)
```

## IAM (Identity and Access Management)

### Sub Account 관리
```json
{
  "subAccountPolicy": {
    "accountName": "dev-team-account",
    "description": "개발팀 전용 계정",
    "permissions": [
      {
        "service": "server",
        "actions": ["create", "read", "update"],
        "resources": ["server:dev-*"]
      },
      {
        "service": "vpc",
        "actions": ["read"],
        "resources": ["vpc:dev-vpc"]
      }
    ],
    "conditions": {
      "ipAddress": ["203.0.113.0/24"],
      "timeRange": {
        "start": "09:00",
        "end": "18:00"
      }
    }
  }
}
```

### 최소 권한 원칙 적용
```bash
# 개발 환경 권한 예시
개발자 계정:
- Server: 개발 서버만 생성/수정/조회
- VPC: 개발 VPC만 조회
- Storage: 개발 스토리지만 접근
- 시간 제한: 업무 시간 (09:00-18:00)
- IP 제한: 사무실 IP 대역

운영자 계정:
- Server: 운영 서버 전체 권한
- Database: 운영 DB 관리 권한
- Load Balancer: 운영 LB 설정 권한
- MFA 필수
- 모든 작업 로그 기록
```

### MFA (Multi-Factor Authentication) 설정
```python
# NCP API를 통한 MFA 설정 예시
import requests
import pyotp

class NCPMFAManager:
    def __init__(self, access_key, secret_key):
        self.access_key = access_key
        self.secret_key = secret_key
        self.base_url = "https://ncloud.apigw.ntruss.com"
    
    def enable_mfa(self, sub_account_no):
        """MFA 활성화"""
        endpoint = f"{self.base_url}/iam/v2/enableMfa"
        
        headers = self._generate_auth_headers()
        data = {
            "subAccountNo": sub_account_no,
            "mfaType": "TOTP"
        }
        
        response = requests.post(endpoint, headers=headers, json=data)
        
        if response.status_code == 200:
            secret_key = response.json()['secretKey']
            qr_code_url = response.json()['qrCodeUrl']
            
            return {
                'secret_key': secret_key,
                'qr_code_url': qr_code_url,
                'backup_codes': response.json().get('backupCodes', [])
            }
        
        return None
    
    def verify_mfa_token(self, secret_key, token):
        """MFA 토큰 검증"""
        totp = pyotp.TOTP(secret_key)
        return totp.verify(token)
```

## ACG (Access Control Group)

### 인바운드 규칙 설정
```python
# ACG 규칙 설정 예시
acg_rules = {
    "web_server_acg": {
        "inbound": [
            {
                "protocol": "TCP",
                "port": "80",
                "source": "0.0.0.0/0",
                "description": "HTTP 웹 트래픽"
            },
            {
                "protocol": "TCP", 
                "port": "443",
                "source": "0.0.0.0/0",
                "description": "HTTPS 웹 트래픽"
            },
            {
                "protocol": "TCP",
                "port": "22",
                "source": "203.0.113.0/24",
                "description": "SSH 관리 접근 (사무실 IP만)"
            }
        ],
        "outbound": [
            {
                "protocol": "ALL",
                "port": "ALL",
                "destination": "0.0.0.0/0",
                "description": "모든 아웃바운드 허용"
            }
        ]
    },
    
    "database_acg": {
        "inbound": [
            {
                "protocol": "TCP",
                "port": "3306",
                "source": "acg:web_server_acg",
                "description": "웹 서버에서 DB 접근"
            },
            {
                "protocol": "TCP",
                "port": "22",
                "source": "203.0.113.100/32",
                "description": "DBA 전용 SSH 접근"
            }
        ],
        "outbound": [
            {
                "protocol": "TCP",
                "port": "80,443",
                "destination": "0.0.0.0/0",
                "description": "패키지 업데이트용"
            }
        ]
    }
}
```

### 마이크로 세그멘테이션
```bash
# 애플리케이션 계층별 ACG 분리
Frontend ACG:
- 인바운드: HTTP(80), HTTPS(443) from 0.0.0.0/0
- 아웃바운드: Backend ACG로만 통신

Backend ACG:
- 인바운드: API 포트(8080) from Frontend ACG
- 아웃바운드: Database ACG로만 통신

Database ACG:
- 인바운드: DB 포트(3306) from Backend ACG
- 아웃바운드: 패키지 업데이트만 허용

Management ACG:
- 인바운드: SSH(22) from 관리자 IP만
- 아웃바운드: 모든 ACG 접근 가능
```

## Network ACL

### 서브넷 레벨 보안
```python
# Network ACL 설정 예시
network_acl_rules = {
    "public_subnet_acl": {
        "inbound": [
            {
                "rule_no": 100,
                "protocol": "TCP",
                "port_range": "80",
                "cidr_block": "0.0.0.0/0",
                "action": "ALLOW"
            },
            {
                "rule_no": 110,
                "protocol": "TCP", 
                "port_range": "443",
                "cidr_block": "0.0.0.0/0",
                "action": "ALLOW"
            },
            {
                "rule_no": 200,
                "protocol": "TCP",
                "port_range": "22",
                "cidr_block": "203.0.113.0/24",
                "action": "ALLOW"
            },
            {
                "rule_no": 32767,
                "protocol": "ALL",
                "port_range": "ALL",
                "cidr_block": "0.0.0.0/0",
                "action": "DENY"
            }
        ]
    },
    
    "private_subnet_acl": {
        "inbound": [
            {
                "rule_no": 100,
                "protocol": "ALL",
                "port_range": "ALL",
                "cidr_block": "10.0.0.0/16",
                "action": "ALLOW"
            },
            {
                "rule_no": 32767,
                "protocol": "ALL",
                "port_range": "ALL", 
                "cidr_block": "0.0.0.0/0",
                "action": "DENY"
            }
        ]
    }
}
```

## VPC 네트워크 설계

### 다중 계층 VPC 아키텍처
```
VPC (10.0.0.0/16)
├── Public Subnet (10.0.1.0/24)
│   ├── NAT Gateway
│   ├── Load Balancer
│   └── Bastion Host
├── Private Subnet - Web (10.0.2.0/24)
│   ├── Web Servers
│   └── Application Servers
├── Private Subnet - DB (10.0.3.0/24)
│   ├── Database Servers
│   └── Cache Servers
└── Management Subnet (10.0.4.0/24)
    ├── Monitoring Servers
    └── Log Servers
```

### 라우팅 테이블 설정
```python
# VPC 라우팅 설정
routing_tables = {
    "public_route_table": {
        "routes": [
            {
                "destination": "10.0.0.0/16",
                "target": "LOCAL"
            },
            {
                "destination": "0.0.0.0/0",
                "target": "igw-12345678"  # Internet Gateway
            }
        ]
    },
    
    "private_route_table": {
        "routes": [
            {
                "destination": "10.0.0.0/16", 
                "target": "LOCAL"
            },
            {
                "destination": "0.0.0.0/0",
                "target": "nat-12345678"  # NAT Gateway
            }
        ]
    },
    
    "db_route_table": {
        "routes": [
            {
                "destination": "10.0.0.0/16",
                "target": "LOCAL"
            }
            # 외부 인터넷 접근 차단
        ]
    }
}
```

## 데이터 보안

### KMS (Key Management Service)
```python
# NCP KMS 활용 예시
import base64
from cryptography.fernet import Fernet

class NCPKMSManager:
    def __init__(self, kms_key_id):
        self.kms_key_id = kms_key_id
        self.kms_client = self._init_kms_client()
    
    def encrypt_data(self, plaintext_data):
        """데이터 암호화"""
        # KMS에서 데이터 키 생성
        data_key_response = self.kms_client.generate_data_key(
            KeyId=self.kms_key_id,
            KeySpec='AES_256'
        )
        
        # 평문 데이터 키로 데이터 암호화
        cipher = Fernet(base64.urlsafe_b64encode(data_key_response['Plaintext'][:32]))
        encrypted_data = cipher.encrypt(plaintext_data.encode())
        
        return {
            'encrypted_data': base64.b64encode(encrypted_data).decode(),
            'encrypted_data_key': base64.b64encode(data_key_response['CiphertextBlob']).decode()
        }
    
    def decrypt_data(self, encrypted_data, encrypted_data_key):
        """데이터 복호화"""
        # 암호화된 데이터 키 복호화
        decrypted_key_response = self.kms_client.decrypt(
            CiphertextBlob=base64.b64decode(encrypted_data_key)
        )
        
        # 복호화된 데이터 키로 데이터 복호화
        cipher = Fernet(base64.urlsafe_b64encode(decrypted_key_response['Plaintext'][:32]))
        decrypted_data = cipher.decrypt(base64.b64decode(encrypted_data))
        
        return decrypted_data.decode()
```

### SSL 인증서 관리
```bash
# SSL 인증서 자동 갱신 스크립트
#!/bin/bash

DOMAIN="example.com"
CERT_PATH="/etc/ssl/certs"
KEY_PATH="/etc/ssl/private"

# Let's Encrypt 인증서 갱신
certbot renew --quiet

# NCP Load Balancer에 인증서 업로드
ncp-cli lb upload-ssl-certificate \
    --certificate-name "${DOMAIN}-$(date +%Y%m%d)" \
    --certificate-file "${CERT_PATH}/${DOMAIN}.crt" \
    --private-key-file "${KEY_PATH}/${DOMAIN}.key" \
    --certificate-chain-file "${CERT_PATH}/${DOMAIN}-chain.crt"

# 로드 밸런서에 새 인증서 적용
ncp-cli lb update-ssl-certificate \
    --load-balancer-instance-no "lb-12345" \
    --certificate-name "${DOMAIN}-$(date +%Y%m%d)"
```

## 컴플라이언스 및 감사

### ISMS-P 준수 사항
```python
# 보안 감사 로그 수집
class SecurityAuditLogger:
    def __init__(self):
        self.audit_events = []
    
    def log_access_event(self, user_id, resource, action, result, ip_address):
        """접근 이벤트 로깅"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'event_type': 'ACCESS',
            'user_id': user_id,
            'resource': resource,
            'action': action,
            'result': result,  # SUCCESS, FAILURE
            'source_ip': ip_address,
            'user_agent': request.headers.get('User-Agent'),
            'session_id': session.get('session_id')
        }
        
        self.audit_events.append(event)
        self._send_to_siem(event)
    
    def log_privilege_escalation(self, user_id, old_role, new_role, approver):
        """권한 변경 로깅"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'event_type': 'PRIVILEGE_CHANGE',
            'user_id': user_id,
            'old_role': old_role,
            'new_role': new_role,
            'approver': approver,
            'change_reason': 'Role escalation approved'
        }
        
        self.audit_events.append(event)
        self._send_to_siem(event)
    
    def generate_compliance_report(self, start_date, end_date):
        """컴플라이언스 보고서 생성"""
        filtered_events = [
            event for event in self.audit_events
            if start_date <= event['timestamp'] <= end_date
        ]
        
        report = {
            'period': f"{start_date} to {end_date}",
            'total_events': len(filtered_events),
            'failed_access_attempts': len([
                e for e in filtered_events 
                if e.get('result') == 'FAILURE'
            ]),
            'privilege_changes': len([
                e for e in filtered_events
                if e.get('event_type') == 'PRIVILEGE_CHANGE'
            ]),
            'compliance_status': 'COMPLIANT'
        }
        
        return report
```

### 개인정보 보호 조치
```python
# 개인정보 암호화 및 마스킹
class PersonalDataProtection:
    def __init__(self, kms_manager):
        self.kms = kms_manager
        
    def encrypt_personal_data(self, data):
        """개인정보 암호화"""
        sensitive_fields = ['name', 'email', 'phone', 'address', 'ssn']
        
        encrypted_data = data.copy()
        for field in sensitive_fields:
            if field in data:
                encrypted_data[field] = self.kms.encrypt_data(str(data[field]))
        
        return encrypted_data
    
    def mask_personal_data(self, data, user_role):
        """역할별 개인정보 마스킹"""
        if user_role == 'admin':
            return data  # 관리자는 전체 데이터 조회 가능
        
        masked_data = data.copy()
        
        # 일반 사용자는 마스킹된 데이터만 조회
        if 'email' in masked_data:
            email = masked_data['email']
            masked_data['email'] = email[:2] + '*' * (len(email) - 5) + email[-3:]
        
        if 'phone' in masked_data:
            phone = masked_data['phone']
            masked_data['phone'] = phone[:3] + '-****-' + phone[-4:]
        
        return masked_data
```

## Kubernetes 보안

### Pod Security Standards
```yaml
# Pod Security Policy 예시
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: ncp-restricted-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

### Network Policy
```yaml
# Kubernetes Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-app-netpol
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: frontend
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 3306
```

### 컨테이너 이미지 스캔
```python
# 컨테이너 보안 스캔 자동화
import docker
import json

class ContainerSecurityScanner:
    def __init__(self):
        self.docker_client = docker.from_env()
    
    def scan_image_vulnerabilities(self, image_name):
        """이미지 취약점 스캔"""
        # Trivy를 사용한 취약점 스캔
        scan_result = subprocess.run([
            'trivy', 'image', '--format', 'json', image_name
        ], capture_output=True, text=True)
        
        if scan_result.returncode == 0:
            vulnerabilities = json.loads(scan_result.stdout)
            return self._analyze_vulnerabilities(vulnerabilities)
        
        return None
    
    def _analyze_vulnerabilities(self, scan_data):
        """취약점 분석"""
        critical_count = 0
        high_count = 0
        medium_count = 0
        
        for result in scan_data.get('Results', []):
            for vuln in result.get('Vulnerabilities', []):
                severity = vuln.get('Severity', '').upper()
                if severity == 'CRITICAL':
                    critical_count += 1
                elif severity == 'HIGH':
                    high_count += 1
                elif severity == 'MEDIUM':
                    medium_count += 1
        
        return {
            'critical': critical_count,
            'high': high_count,
            'medium': medium_count,
            'deployment_allowed': critical_count == 0 and high_count < 5
        }
```

## 실무 면접 예상 질문

### NCP 보안 모델 질문
1. **"NCP의 ACG와 Network ACL의 차이점과 각각의 활용 시나리오는?"**
   - ACG: 인스턴스 레벨 보안 그룹
   - Network ACL: 서브넷 레벨 네트워크 제어
   - Stateful vs Stateless 차이점

2. **"VPC 환경에서 다중 계층 보안을 어떻게 구현하시겠습니까?"**
   - 서브넷 분리 전략
   - 라우팅 테이블 설계
   - 보안 그룹 계층화

3. **"클라우드 환경에서 개인정보 보호를 위한 기술적 조치는?"**
   - 데이터 암호화 (전송 중, 저장 중)
   - 접근 제어 및 로깅
   - 데이터 마스킹 및 익명화

### 컴플라이언스 질문
1. **"ISMS-P 인증 기준에 따른 보안 관리 체계는?"**
2. **"클라우드 환경에서 감사 로그 관리 방안은?"**
3. **"Kubernetes 환경의 보안 위험 요소와 대응 방안은?"**

### 실무 경험 어필 포인트
- **다중 보안 계층**: ACG + Network ACL 이중 보안
- **최소 권한 원칙**: IAM 정책 세분화
- **컴플라이언스**: ISMS-P 기준 준수
- **컨테이너 보안**: K8s 보안 정책 구현
- **자동화**: 보안 모니터링 및 대응 자동화
