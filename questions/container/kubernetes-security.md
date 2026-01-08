---
question: "⭐ Kubernetes 환경에서 컨테이너 보안을 위한 Pod Security Standards, Network Policy, 그리고 이미지 스캔 구현 방법을 설명해주세요."
shortAnswer: "Pod Security Standards는 Privileged, Baseline, Restricted 3단계로 보안 정책을 적용하고, Network Policy로 파드 간 통신을 제어하며, 이미지 스캔 도구(Trivy, Clair)로 취약점을 사전 탐지하여 컨테이너 보안을 강화합니다."
---

# Kubernetes 보안

## Pod Security Standards

### 보안 정책 레벨
```yaml
# Pod Security Standards 3단계
Privileged (특권):
- 제한 없음
- 모든 권한 허용
- 개발/테스트 환경용

Baseline (기본):
- 기본적인 보안 제한
- 알려진 권한 상승 방지
- 일반적인 워크로드용

Restricted (제한):
- 강화된 보안 제한
- 최소 권한 원칙 적용
- 프로덕션 환경 권장
```

### Pod Security Policy 구현
```yaml
# Restricted Pod Security Policy
apiVersion: v1
kind: Namespace
metadata:
  name: secure-namespace
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted

---
# 보안 강화된 Pod 예시
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
  namespace: secure-namespace
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  
  containers:
  - name: app-container
    image: nginx:1.21-alpine
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      runAsNonRoot: true
      runAsUser: 1000
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
    
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
    
    volumeMounts:
    - name: tmp-volume
      mountPath: /tmp
    - name: cache-volume
      mountPath: /var/cache/nginx
  
  volumes:
  - name: tmp-volume
    emptyDir: {}
  - name: cache-volume
    emptyDir: {}
```

### Security Context 설정
```yaml
# 컨테이너 보안 컨텍스트 상세 설정
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: secure-app
  template:
    metadata:
      labels:
        app: secure-app
    spec:
      serviceAccountName: secure-service-account
      
      # Pod 레벨 보안 컨텍스트
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
        supplementalGroups: [1001]
        
        # SELinux 설정
        seLinuxOptions:
          level: "s0:c123,c456"
        
        # seccomp 프로파일
        seccompProfile:
          type: RuntimeDefault
        
        # sysctl 설정
        sysctls:
        - name: net.core.somaxconn
          value: "1024"
      
      containers:
      - name: app
        image: myapp:secure-v1.0
        
        # 컨테이너 레벨 보안 컨텍스트
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1001
          
          # Linux Capabilities 제한
          capabilities:
            drop:
            - ALL
            add:
            - NET_BIND_SERVICE
            - CHOWN
        
        # 리소스 제한
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        
        # 환경 변수 (민감 정보는 Secret 사용)
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        
        # 볼륨 마운트 (읽기 전용)
        volumeMounts:
        - name: config-volume
          mountPath: /etc/config
          readOnly: true
        - name: tmp-volume
          mountPath: /tmp
      
      volumes:
      - name: config-volume
        configMap:
          name: app-config
      - name: tmp-volume
        emptyDir: {}
```

## Network Policy

### 네트워크 분할 및 격리
```yaml
# 기본 거부 정책 (Default Deny)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress

---
# 웹 애플리케이션 네트워크 정책
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-app-netpol
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-app
      tier: frontend
  
  policyTypes:
  - Ingress
  - Egress
  
  # 인바운드 트래픽 규칙
  ingress:
  - from:
    # 로드 밸런서에서만 접근 허용
    - namespaceSelector:
        matchLabels:
          name: ingress-system
    ports:
    - protocol: TCP
      port: 8080
  
  # 아웃바운드 트래픽 규칙
  egress:
  # API 서버로의 통신 허용
  - to:
    - podSelector:
        matchLabels:
          app: api-server
          tier: backend
    ports:
    - protocol: TCP
      port: 3000
  
  # DNS 조회 허용
  - to: []
    ports:
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53

---
# 데이터베이스 네트워크 정책
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-netpol
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: database
      tier: data
  
  policyTypes:
  - Ingress
  
  ingress:
  # API 서버에서만 접근 허용
  - from:
    - podSelector:
        matchLabels:
          app: api-server
          tier: backend
    ports:
    - protocol: TCP
      port: 5432
  
  # 백업 서비스에서 접근 허용
  - from:
    - podSelector:
        matchLabels:
          app: backup-service
    ports:
    - protocol: TCP
      port: 5432
```

### 마이크로서비스 간 통신 제어
```yaml
# 마이크로서비스 네트워크 정책
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: microservices-communication
  namespace: microservices
spec:
  podSelector:
    matchLabels:
      tier: backend
  
  policyTypes:
  - Ingress
  - Egress
  
  ingress:
  # 같은 네임스페이스 내 서비스 간 통신만 허용
  - from:
    - namespaceSelector:
        matchLabels:
          name: microservices
    - podSelector:
        matchLabels:
          tier: frontend
  
  egress:
  # 외부 API 호출 허용 (특정 IP만)
  - to:
    - ipBlock:
        cidr: 203.0.113.0/24
    ports:
    - protocol: TCP
      port: 443
  
  # 내부 서비스 통신 허용
  - to:
    - namespaceSelector:
        matchLabels:
          name: microservices
```

## 이미지 보안 및 스캔

### 컨테이너 이미지 스캔
```python
# Trivy를 이용한 이미지 스캔 자동화
import subprocess
import json
import yaml

class ContainerImageScanner:
    def __init__(self):
        self.scan_results = {}
        self.vulnerability_threshold = {
            'CRITICAL': 0,  # Critical 취약점 0개 허용
            'HIGH': 5,      # High 취약점 5개까지 허용
            'MEDIUM': 20    # Medium 취약점 20개까지 허용
        }
    
    def scan_image(self, image_name, image_tag='latest'):
        """컨테이너 이미지 취약점 스캔"""
        full_image_name = f"{image_name}:{image_tag}"
        
        try:
            # Trivy 스캔 실행
            result = subprocess.run([
                'trivy', 'image', 
                '--format', 'json',
                '--severity', 'CRITICAL,HIGH,MEDIUM,LOW',
                full_image_name
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                scan_data = json.loads(result.stdout)
                analysis = self.analyze_scan_results(scan_data, full_image_name)
                self.scan_results[full_image_name] = analysis
                return analysis
            else:
                return {'error': f'스캔 실패: {result.stderr}'}
                
        except subprocess.TimeoutExpired:
            return {'error': '스캔 시간 초과'}
        except Exception as e:
            return {'error': f'스캔 오류: {str(e)}'}
    
    def analyze_scan_results(self, scan_data, image_name):
        """스캔 결과 분석"""
        vulnerability_counts = {
            'CRITICAL': 0,
            'HIGH': 0,
            'MEDIUM': 0,
            'LOW': 0
        }
        
        vulnerabilities = []
        
        for result in scan_data.get('Results', []):
            for vuln in result.get('Vulnerabilities', []):
                severity = vuln.get('Severity', 'UNKNOWN')
                if severity in vulnerability_counts:
                    vulnerability_counts[severity] += 1
                
                vulnerabilities.append({
                    'id': vuln.get('VulnerabilityID', ''),
                    'severity': severity,
                    'package': vuln.get('PkgName', ''),
                    'version': vuln.get('InstalledVersion', ''),
                    'fixed_version': vuln.get('FixedVersion', ''),
                    'title': vuln.get('Title', ''),
                    'description': vuln.get('Description', '')[:200] + '...'
                })
        
        # 배포 허용 여부 결정
        deployment_allowed = self.check_deployment_policy(vulnerability_counts)
        
        return {
            'image_name': image_name,
            'scan_date': datetime.now().isoformat(),
            'vulnerability_counts': vulnerability_counts,
            'total_vulnerabilities': sum(vulnerability_counts.values()),
            'deployment_allowed': deployment_allowed,
            'vulnerabilities': vulnerabilities[:50],  # 상위 50개만 표시
            'recommendations': self.generate_recommendations(vulnerability_counts, vulnerabilities)
        }
    
    def check_deployment_policy(self, vulnerability_counts):
        """배포 정책 확인"""
        for severity, threshold in self.vulnerability_threshold.items():
            if vulnerability_counts.get(severity, 0) > threshold:
                return False
        return True
    
    def generate_security_report(self, namespace='default'):
        """네임스페이스별 보안 보고서 생성"""
        # Kubernetes에서 실행 중인 이미지 목록 조회
        try:
            result = subprocess.run([
                'kubectl', 'get', 'pods', 
                '-n', namespace,
                '-o', 'jsonpath={.items[*].spec.containers[*].image}'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                images = set(result.stdout.split())
                
                report = {
                    'namespace': namespace,
                    'report_date': datetime.now().isoformat(),
                    'total_images': len(images),
                    'scanned_images': 0,
                    'secure_images': 0,
                    'vulnerable_images': 0,
                    'image_details': []
                }
                
                for image in images:
                    scan_result = self.scan_image(image.split(':')[0], 
                                                image.split(':')[1] if ':' in image else 'latest')
                    
                    if 'error' not in scan_result:
                        report['scanned_images'] += 1
                        
                        if scan_result['deployment_allowed']:
                            report['secure_images'] += 1
                        else:
                            report['vulnerable_images'] += 1
                        
                        report['image_details'].append({
                            'image': image,
                            'vulnerabilities': scan_result['vulnerability_counts'],
                            'deployment_allowed': scan_result['deployment_allowed']
                        })
                
                return report
                
        except Exception as e:
            return {'error': f'보고서 생성 실패: {str(e)}'}

# 사용 예시
scanner = ContainerImageScanner()

# 개별 이미지 스캔
scan_result = scanner.scan_image('nginx', '1.21')
print(f"스캔 결과: {scan_result}")

# 네임스페이스 전체 보안 보고서
security_report = scanner.generate_security_report('production')
print(f"보안 보고서: {security_report}")
```

### Admission Controller 구현
```yaml
# OPA Gatekeeper를 이용한 정책 적용
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8srequiredsecuritycontext
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredSecurityContext
      validation:
        openAPIV3Schema:
          type: object
          properties:
            runAsNonRoot:
              type: boolean
            readOnlyRootFilesystem:
              type: boolean
            allowPrivilegeEscalation:
              type: boolean
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredsecuritycontext
        
        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not container.securityContext.runAsNonRoot
          msg := "Container must run as non-root user"
        }
        
        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not container.securityContext.readOnlyRootFilesystem
          msg := "Container must have read-only root filesystem"
        }
        
        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          container.securityContext.allowPrivilegeEscalation != false
          msg := "Container must not allow privilege escalation"
        }

---
# 보안 정책 적용
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredSecurityContext
metadata:
  name: must-have-security-context
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    namespaces: ["production", "staging"]
  parameters:
    runAsNonRoot: true
    readOnlyRootFilesystem: true
    allowPrivilegeEscalation: false
```

### RBAC 보안 설정
```yaml
# 최소 권한 RBAC 설정
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account
  namespace: production

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: app-role
rules:
# ConfigMap 읽기 권한만
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]
# Secret 읽기 권한만 (특정 Secret만)
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["app-secret"]
  verbs: ["get"]
# Pod 상태 조회 권한만
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-role-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: app-service-account
  namespace: production
roleRef:
  kind: Role
  name: app-role
  apiGroup: rbac.authorization.k8s.io
```

## 실무 면접 예상 질문

### Kubernetes 보안 기본
1. **"Pod Security Standards의 3단계를 설명해주세요"**
   - Privileged: 제한 없음 (개발용)
   - Baseline: 기본 보안 (일반용)
   - Restricted: 강화 보안 (프로덕션용)

2. **"컨테이너를 root 사용자로 실행하면 안 되는 이유는?"**
   - 권한 상승 공격 위험
   - 호스트 시스템 침해 가능성
   - 최소 권한 원칙 위배

### 네트워크 보안 질문
1. **"Network Policy를 사용하는 이유는?"**
   - 마이크로서비스 간 통신 제어
   - 네트워크 분할 및 격리
   - 측면 이동 공격 방지

2. **"기본 거부(Default Deny) 정책이 중요한 이유는?"**
   - 명시적 허용만 통신 가능
   - 의도하지 않은 통신 차단
   - 보안 기본값 설정

### 이미지 보안 질문
1. **"컨테이너 이미지 스캔을 언제 수행해야 하나요?"**
   - 빌드 시점 (CI/CD 파이프라인)
   - 배포 전 (Admission Controller)
   - 런타임 (정기적 스캔)

2. **"취약점이 발견된 이미지는 어떻게 처리하나요?"**
   - 심각도별 대응 정책 적용
   - 패치 버전으로 업데이트
   - 배포 차단 및 알림

### 네이버 클라우드 경험 어필 포인트
- **컨테이너 보안**: Pod Security Policy 설계 및 적용
- **네트워크 격리**: Network Policy를 통한 마이크로서비스 보안
- **이미지 관리**: 취약점 스캔 및 보안 정책 적용
- **RBAC 설계**: 최소 권한 원칙 기반 권한 관리
- **자동화**: 보안 정책 자동 적용 및 모니터링

### 실무 시나리오 질문
1. **"프로덕션 환경에서 컨테이너 보안을 어떻게 강화하시겠습니까?"**
2. **"취약점이 있는 이미지가 배포되는 것을 어떻게 방지하시겠습니까?"**
3. **"Kubernetes 클러스터에서 보안 사고가 발생했을 때 대응 방법은?"**
