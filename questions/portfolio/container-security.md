---
question: "컨테이너 환경의 보안 이슈와 해결 방안을 설명해주세요"
shortAnswer: "컨테이너 이미지 취약점, 권한 상승, 네트워크 노출이 주요 이슈입니다. 이미지 스캔 도구로 취약점을 사전 탐지하고, 루트 권한 실행을 피하며, Pod Security Policy로 보안 정책을 강제합니다. 또한 네트워크 정책으로 Pod 간 통신을 제한하고, 시크릿 관리로 민감 정보를 보호합니다."
---

## 상세 답변

### 주요 보안 이슈

#### 1. 이미지 취약점
- 오래된 베이스 이미지 사용
- 알려진 CVE 포함
- 불필요한 패키지 설치

**해결 방안**:
- Trivy, Snyk 등 이미지 스캔
- 최신 이미지 사용
- 멀티 스테이지 빌드로 최소화

#### 2. 권한 상승
- 컨테이너를 root로 실행
- 호스트 리소스 접근 가능
- 특권 컨테이너 사용

**해결 방안**:
- 비root 사용자로 실행
- Pod Security Policy 적용
- securityContext 설정

#### 3. 네트워크 노출
- 모든 Pod 간 통신 허용
- 불필요한 포트 노출
- 서비스 메시 부재

**해결 방안**:
- Network Policy로 통신 제한
- Service Mesh (Istio) 도입
- Ingress Controller 사용

### Kubernetes 보안 베스트 프랙티스

**워커 노드 보안**
- OS 패치 자동화
- 최소 권한 kubelet 설정
- 노드 간 격리

**Pod 보안**
- readOnlyRootFilesystem
- runAsNonRoot
- allowPrivilegeEscalation: false

**시크릿 관리**
- Kubernetes Secrets 암호화
- Vault 등 외부 시크릿 관리
- RBAC로 접근 제어
