---
question: "Kubernetes란 무엇이며 주요 개념은 무엇인가요?"
shortAnswer: "Kubernetes는 컨테이너 오케스트레이션 플랫폼으로 컨테이너화된 애플리케이션의 배포, 확장, 관리를 자동화합니다. Pod, Service, Deployment, ReplicaSet 등의 주요 개념이 있으며, 자동 스케일링, 로드밸런싱, 자가 치유 기능을 제공합니다."
---

## Kubernetes 완벽 가이드

### Kubernetes란?

컨테이너 오케스트레이션 플랫폼으로, 여러 호스트에 걸쳐 컨테이너를 자동으로 배포, 확장, 관리합니다.

### 주요 개념

#### Pod
- Kubernetes의 최소 배포 단위
- 하나 이상의 컨테이너 그룹
- 같은 네트워크와 스토리지 공유

#### Service
- Pod에 대한 네트워크 접근 제공
- 로드밸런싱
- 타입: ClusterIP, NodePort, LoadBalancer

#### Deployment
- Pod의 선언적 업데이트
- 롤링 업데이트, 롤백
- ReplicaSet 관리

#### ReplicaSet
- 지정된 수의 Pod 복제본 유지
- 자가 치유

### 아키텍처

#### Master Node (Control Plane)
- API Server: 모든 요청 처리
- Scheduler: Pod 배치 결정
- Controller Manager: 상태 관리
- etcd: 클러스터 데이터 저장

#### Worker Node
- Kubelet: Pod 실행 관리
- Kube-proxy: 네트워킹
- Container Runtime: Docker, containerd 등

### 주요 기능

1. **자동 스케일링**: HPA, VPA
2. **로드밸런싱**: 트래픽 분산
3. **자가 치유**: 실패한 Pod 자동 재시작
4. **롤링 업데이트**: 무중단 배포
5. **시크릿 관리**: 민감 정보 관리

### 실무 활용

- 마이크로서비스 운영
- 멀티 클라우드 환경
- 고가용성 애플리케이션
- DevOps 자동화
