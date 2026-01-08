---
question: "⭐ 클라우드 환경에서 IAM(Identity and Access Management)의 최소 권한 원칙과 역할 기반 접근 제어(RBAC) 구현 방법을 설명해주세요."
shortAnswer: "최소 권한 원칙은 사용자에게 업무 수행에 필요한 최소한의 권한만 부여하는 보안 원칙입니다. RBAC는 역할별로 권한을 그룹화하여 관리하며, 사용자-역할-권한의 3단계 구조로 접근 제어를 체계화합니다."
---

# IAM 및 접근 제어 원칙

## 최소 권한 원칙 (Principle of Least Privilege)

### 기본 개념
```
최소 권한 원칙:
사용자 → 필요한 최소한의 권한만 부여
      → 업무 완료 후 권한 회수
      → 정기적 권한 검토

예시:
개발자 → 개발 환경만 접근 가능
운영자 → 운영 환경 읽기 전용
관리자 → 전체 환경 관리 권한 (MFA 필수)
```

### 권한 계층 구조
```bash
# 신입 개발자 권한 예시
개발 환경:
├── 서버: 개발 서버 조회/생성 (운영 서버 접근 불가)
├── 데이터베이스: 개발 DB 읽기/쓰기 (운영 DB 접근 불가)
├── 스토리지: 개발 버킷만 접근
├── 네트워크: VPC 조회만 가능
└── 시간 제한: 업무 시간 (09:00-18:00)

경력 개발자 권한:
├── 개발 환경: 전체 권한
├── 스테이징 환경: 배포 권한
├── 운영 환경: 조회 권한만
└── 로그 접근: 애플리케이션 로그만

시스템 관리자 권한:
├── 모든 환경: 전체 권한
├── 사용자 관리: 계정 생성/삭제
├── 보안 설정: 방화벽, ACL 관리
└── 필수 조건: MFA, 승인 프로세스
```

## RBAC (Role-Based Access Control)

### RBAC 구조
```
사용자 (User) ←→ 역할 (Role) ←→ 권한 (Permission)
     |              |              |
   홍길동        개발자 역할      서버 생성 권한
   김철수        운영자 역할      DB 조회 권한
   이영희        관리자 역할      사용자 관리 권한
```

### 역할 정의 예시
```json
{
  "roles": {
    "junior_developer": {
      "description": "신입 개발자",
      "permissions": [
        "server:read:dev-*",
        "server:create:dev-*",
        "database:read:dev-*",
        "database:write:dev-*",
        "storage:read:dev-bucket",
        "storage:write:dev-bucket"
      ],
      "conditions": {
        "time_restriction": "09:00-18:00",
        "ip_restriction": "office-network",
        "mfa_required": false
      }
    },
    
    "senior_developer": {
      "description": "시니어 개발자",
      "permissions": [
        "server:*:dev-*",
        "server:*:staging-*",
        "server:read:prod-*",
        "database:*:dev-*",
        "database:*:staging-*",
        "database:read:prod-*",
        "deployment:execute:staging"
      ],
      "conditions": {
        "mfa_required": true,
        "approval_required": ["deployment:execute"]
      }
    },
    
    "system_admin": {
      "description": "시스템 관리자",
      "permissions": [
        "*:*:*"
      ],
      "conditions": {
        "mfa_required": true,
        "approval_required": ["user:delete", "server:delete:prod-*"],
        "audit_logging": true
      }
    }
  }
}
```

### 동적 권한 할당
```python
# 프로젝트 기반 동적 권한 할당
class DynamicRoleManager:
    def __init__(self):
        self.project_roles = {}
        self.user_projects = {}
    
    def assign_project_role(self, user_id, project_id, role):
        """프로젝트별 역할 할당"""
        if user_id not in self.user_projects:
            self.user_projects[user_id] = {}
        
        self.user_projects[user_id][project_id] = {
            'role': role,
            'assigned_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(days=90)  # 90일 후 만료
        }
    
    def get_user_permissions(self, user_id, resource):
        """사용자의 리소스별 권한 조회"""
        permissions = set()
        
        # 기본 역할 권한
        base_role = self.get_user_base_role(user_id)
        permissions.update(self.get_role_permissions(base_role))
        
        # 프로젝트별 권한
        for project_id, project_info in self.user_projects.get(user_id, {}).items():
            if self.is_project_permission_valid(project_info):
                if resource.startswith(f"project:{project_id}"):
                    project_permissions = self.get_role_permissions(project_info['role'])
                    permissions.update(project_permissions)
        
        return list(permissions)
    
    def cleanup_expired_permissions(self):
        """만료된 권한 정리"""
        current_time = datetime.now()
        
        for user_id in self.user_projects:
            expired_projects = [
                project_id for project_id, info in self.user_projects[user_id].items()
                if info['expires_at'] < current_time
            ]
            
            for project_id in expired_projects:
                del self.user_projects[user_id][project_id]
                print(f"사용자 {user_id}의 프로젝트 {project_id} 권한이 만료되어 제거되었습니다.")
```

## 접근 제어 구현

### 다단계 인증 (MFA)
```python
# MFA 구현 예시
import pyotp
import qrcode
from io import BytesIO

class MFAManager:
    def __init__(self):
        self.user_secrets = {}
    
    def setup_mfa(self, user_id, user_email):
        """MFA 설정"""
        # 사용자별 시크릿 키 생성
        secret = pyotp.random_base32()
        self.user_secrets[user_id] = secret
        
        # TOTP URI 생성
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_email,
            issuer_name="Company Infrastructure"
        )
        
        # QR 코드 생성
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        return {
            'secret': secret,
            'qr_code': img,
            'backup_codes': self.generate_backup_codes(user_id)
        }
    
    def verify_mfa_token(self, user_id, token):
        """MFA 토큰 검증"""
        if user_id not in self.user_secrets:
            return False
        
        secret = self.user_secrets[user_id]
        totp = pyotp.TOTP(secret)
        
        # 시간 동기화 오차를 고려하여 ±1 윈도우 허용
        return totp.verify(token, valid_window=1)
    
    def generate_backup_codes(self, user_id):
        """백업 코드 생성"""
        import secrets
        backup_codes = []
        
        for _ in range(10):
            code = ''.join([str(secrets.randbelow(10)) for _ in range(8)])
            backup_codes.append(f"{code[:4]}-{code[4:]}")
        
        # 백업 코드를 해시하여 저장 (실제로는 데이터베이스에 저장)
        return backup_codes
```

### 조건부 접근 제어
```python
# 조건부 접근 제어
class ConditionalAccessControl:
    def __init__(self):
        self.access_policies = {}
        self.risk_scores = {}
    
    def evaluate_access_request(self, user_id, resource, context):
        """접근 요청 평가"""
        # 기본 권한 확인
        if not self.has_basic_permission(user_id, resource):
            return {'allowed': False, 'reason': '권한 없음'}
        
        # 위험도 평가
        risk_score = self.calculate_risk_score(user_id, context)
        
        # 조건부 정책 적용
        policy_result = self.apply_conditional_policies(user_id, resource, context, risk_score)
        
        return policy_result
    
    def calculate_risk_score(self, user_id, context):
        """위험도 점수 계산"""
        risk_score = 0
        
        # IP 주소 기반 위험도
        if context.get('ip_address') not in self.get_trusted_ips():
            risk_score += 30
        
        # 시간 기반 위험도
        current_hour = datetime.now().hour
        if current_hour < 6 or current_hour > 22:  # 업무 외 시간
            risk_score += 20
        
        # 지역 기반 위험도
        if context.get('country') != 'KR':  # 해외 접속
            risk_score += 40
        
        # 디바이스 기반 위험도
        if not context.get('is_managed_device'):
            risk_score += 25
        
        return min(risk_score, 100)  # 최대 100점
    
    def apply_conditional_policies(self, user_id, resource, context, risk_score):
        """조건부 정책 적용"""
        if risk_score < 30:
            return {'allowed': True, 'additional_auth': False}
        
        elif risk_score < 60:
            return {
                'allowed': True, 
                'additional_auth': True,
                'auth_methods': ['mfa'],
                'message': '추가 인증이 필요합니다.'
            }
        
        elif risk_score < 80:
            return {
                'allowed': True,
                'additional_auth': True, 
                'auth_methods': ['mfa', 'manager_approval'],
                'message': '관리자 승인과 MFA가 필요합니다.'
            }
        
        else:
            return {
                'allowed': False,
                'reason': '위험도가 너무 높아 접근이 차단되었습니다.',
                'contact': '보안팀에 문의하세요.'
            }
```

## 권한 감사 및 모니터링

### 접근 로그 분석
```python
# 접근 패턴 분석
class AccessAuditAnalyzer:
    def __init__(self):
        self.access_logs = []
        self.anomaly_threshold = 0.8
    
    def log_access_event(self, user_id, resource, action, result, context):
        """접근 이벤트 로깅"""
        event = {
            'timestamp': datetime.now(),
            'user_id': user_id,
            'resource': resource,
            'action': action,
            'result': result,  # SUCCESS, DENIED, ERROR
            'ip_address': context.get('ip_address'),
            'user_agent': context.get('user_agent'),
            'session_id': context.get('session_id')
        }
        
        self.access_logs.append(event)
        
        # 실시간 이상 탐지
        if self.detect_anomaly(user_id, event):
            self.trigger_security_alert(user_id, event)
    
    def detect_anomaly(self, user_id, current_event):
        """이상 행동 탐지"""
        # 최근 1시간 내 같은 사용자의 접근 패턴 분석
        recent_events = [
            event for event in self.access_logs
            if event['user_id'] == user_id and 
               (datetime.now() - event['timestamp']).seconds < 3600
        ]
        
        # 비정상적 접근 패턴 감지
        if len(recent_events) > 100:  # 1시간에 100회 이상 접근
            return True
        
        # 실패한 접근 시도가 많은 경우
        failed_attempts = [e for e in recent_events if e['result'] == 'DENIED']
        if len(failed_attempts) > 10:  # 10회 이상 실패
            return True
        
        # 비정상적 시간대 접근
        if current_event['timestamp'].hour < 6 or current_event['timestamp'].hour > 22:
            return True
        
        return False
    
    def generate_audit_report(self, start_date, end_date):
        """감사 보고서 생성"""
        filtered_logs = [
            log for log in self.access_logs
            if start_date <= log['timestamp'] <= end_date
        ]
        
        report = {
            'period': f"{start_date} ~ {end_date}",
            'total_access_attempts': len(filtered_logs),
            'successful_access': len([l for l in filtered_logs if l['result'] == 'SUCCESS']),
            'denied_access': len([l for l in filtered_logs if l['result'] == 'DENIED']),
            'top_users': self.get_top_users(filtered_logs),
            'top_resources': self.get_top_resources(filtered_logs),
            'security_incidents': self.get_security_incidents(filtered_logs)
        }
        
        return report
```

## 실무 면접 예상 질문

### 기본 개념 질문
1. **"최소 권한 원칙이 왜 중요한가요?"**
   - 보안 위험 최소화
   - 내부자 위협 방지
   - 컴플라이언스 준수

2. **"RBAC와 ABAC(Attribute-Based Access Control)의 차이점은?"**
   - RBAC: 역할 기반 접근 제어
   - ABAC: 속성 기반 접근 제어 (더 세밀한 제어)

### 실무 시나리오 질문
1. **"신입 개발자에게 어떤 권한을 부여하시겠습니까?"**
   - 개발 환경만 접근
   - 시간 제한 설정
   - 정기적 권한 검토

2. **"사용자가 퇴사할 때 권한 관리는 어떻게 하나요?"**
   - 즉시 계정 비활성화
   - 관련 시스템 접근 권한 회수
   - 데이터 백업 및 이관

### 보안 관련 질문
1. **"MFA를 도입할 때 고려사항은?"**
   - 사용자 편의성 vs 보안성
   - 백업 인증 방법
   - 비용 및 관리 복잡성

2. **"권한 에스컬레이션 공격을 어떻게 방어하나요?"**
   - 정기적 권한 검토
   - 이상 행동 탐지
   - 승인 프로세스 강화

### 네이버 클라우드 경험 어필 포인트
- **실무 경험**: NCP IAM 정책 설계 및 구현
- **보안 원칙**: 최소 권한 원칙 적용 경험
- **컴플라이언스**: ISMS-P 기준 준수 방안 이해
- **모니터링**: 접근 제어 로그 분석 및 감사
- **자동화**: 권한 관리 프로세스 자동화
