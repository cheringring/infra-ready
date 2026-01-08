---
question: "GPU 공유를 위한 중계서버 구축과 NAS OS 기반 인프라 설계 시 고려해야 할 기술적 요소들과 가상화 기술을 설명해주세요."
shortAnswer: "GPU 공유는 GPU 가상화(vGPU), 컨테이너 기반 격리, 리소스 스케줄링이 핵심이며, NAS OS는 ZFS/Btrfs 파일시스템, RAID 구성, 네트워크 스토리지 프로토콜(NFS/SMB)을 활용합니다. Docker/Kubernetes로 GPU 리소스를 효율적으로 분배할 수 있습니다."
---

# GPU 공유 및 NAS 기반 인프라 구축

## GPU 공유 기술 개요

### GPU 가상화 기술

#### 1. NVIDIA vGPU
```bash
# NVIDIA vGPU 지원 확인
nvidia-smi vgpu

# vGPU 프로파일 조회
nvidia-smi vgpu -q

# GPU 메모리 분할 예시
vGPU Profile: GRID V100D-8Q
- GPU Memory: 8GB
- Max Resolution: 4096x2160
- Max Displays: 4
```

#### 2. GPU 패스스루 (GPU Passthrough)
```bash
# IOMMU 활성화 확인
dmesg | grep -i iommu

# GPU 디바이스 확인
lspci | grep -i nvidia

# VFIO 드라이버 바인딩
echo "10de 1b06" > /sys/bus/pci/drivers/vfio-pci/new_id
```

#### 3. 컨테이너 기반 GPU 공유
```yaml
# Docker Compose GPU 공유 설정
version: '3.8'
services:
  gpu-worker-1:
    image: tensorflow/tensorflow:latest-gpu
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ['0']
              capabilities: [gpu]
    environment:
      - CUDA_VISIBLE_DEVICES=0
    
  gpu-worker-2:
    image: pytorch/pytorch:latest
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ['1']
              capabilities: [gpu]
    environment:
      - CUDA_VISIBLE_DEVICES=1
```

## NAS OS 기반 인프라 설계

### 주요 NAS OS 플랫폼

#### 1. TrueNAS (FreeBSD 기반)
```bash
# ZFS 풀 생성
zpool create tank raidz2 /dev/da0 /dev/da1 /dev/da2 /dev/da3

# 데이터셋 생성
zfs create tank/shared
zfs create tank/backup

# 압축 및 중복제거 설정
zfs set compression=lz4 tank/shared
zfs set dedup=on tank/backup

# 스냅샷 생성
zfs snapshot tank/shared@backup-$(date +%Y%m%d)
```

#### 2. OpenMediaVault (Debian 기반)
```bash
# 디스크 마운트 확인
lsblk

# RAID 구성
mdadm --create /dev/md0 --level=5 --raid-devices=4 /dev/sdb /dev/sdc /dev/sdd /dev/sde

# 파일시스템 생성
mkfs.ext4 /dev/md0

# 자동 마운트 설정
echo "/dev/md0 /srv/dev-disk-by-label-Storage ext4 defaults 0 2" >> /etc/fstab
```

#### 3. Unraid
```bash
# 어레이 상태 확인
cat /proc/mdstat

# 캐시 드라이브 설정
btrfs filesystem show

# Docker 컨테이너 관리
docker ps -a
docker-compose up -d
```

### 네트워크 스토리지 프로토콜

#### NFS (Network File System)
```bash
# NFS 서버 설정
echo "/srv/nfs/shared 192.168.1.0/24(rw,sync,no_subtree_check)" >> /etc/exports
systemctl restart nfs-kernel-server

# 클라이언트 마운트
mount -t nfs 192.168.1.100:/srv/nfs/shared /mnt/shared

# 영구 마운트 설정
echo "192.168.1.100:/srv/nfs/shared /mnt/shared nfs defaults 0 0" >> /etc/fstab
```

#### SMB/CIFS
```bash
# Samba 설정
[shared]
    path = /srv/samba/shared
    browseable = yes
    writable = yes
    guest ok = no
    valid users = @users

# 서비스 재시작
systemctl restart smbd nmbd

# Windows 클라이언트 연결
net use Z: \\192.168.1.100\shared /persistent:yes
```

#### iSCSI
```bash
# iSCSI 타겟 생성
targetcli
/> backstores/fileio create disk1 /srv/iscsi/disk1.img 10G
/> iscsi/ create iqn.2024-01.com.company:target1
/> iscsi/iqn.2024-01.com.company:target1/tpg1/luns create /backstores/fileio/disk1

# 클라이언트 연결
iscsiadm -m discovery -t st -p 192.168.1.100
iscsiadm -m node --login
```

## GPU 공유 중계서버 아키텍처

### 시스템 구성도
```
                    [클라이언트들]
                         |
                    [로드 밸런서]
                         |
              [GPU 스케줄러 & 중계서버]
                         |
        ┌────────────────┼────────────────┐
   [GPU Node 1]    [GPU Node 2]    [GPU Node 3]
   - RTX 4090      - RTX 4090      - RTX 4090
   - 24GB VRAM     - 24GB VRAM     - 24GB VRAM
        |               |               |
   [NAS Storage - 공유 데이터 및 모델]
```

### 중계서버 구현 예시
```python
# GPU 리소스 관리자
import asyncio
import docker
import nvidia_ml_py3 as nvml
from typing import Dict, List, Optional

class GPUResourceManager:
    def __init__(self):
        self.client = docker.from_env()
        nvml.nvmlInit()
        self.gpu_nodes = self._discover_gpu_nodes()
        self.job_queue = asyncio.Queue()
        
    def _discover_gpu_nodes(self) -> List[Dict]:
        """GPU 노드 자동 발견"""
        nodes = []
        device_count = nvml.nvmlDeviceGetCount()
        
        for i in range(device_count):
            handle = nvml.nvmlDeviceGetHandleByIndex(i)
            name = nvml.nvmlDeviceGetName(handle).decode('utf-8')
            memory_info = nvml.nvmlDeviceGetMemoryInfo(handle)
            
            nodes.append({
                'id': i,
                'name': name,
                'total_memory': memory_info.total,
                'free_memory': memory_info.free,
                'used_memory': memory_info.used,
                'utilization': nvml.nvmlDeviceGetUtilizationRates(handle).gpu
            })
        
        return nodes
    
    async def schedule_job(self, job_request: Dict) -> Dict:
        """작업 스케줄링"""
        required_memory = job_request.get('memory_gb', 1) * 1024**3
        required_compute = job_request.get('compute_units', 1)
        
        # 최적 GPU 선택
        best_gpu = self._select_best_gpu(required_memory, required_compute)
        
        if not best_gpu:
            return {'status': 'error', 'message': 'No available GPU resources'}
        
        # 컨테이너 실행
        container = await self._run_container(job_request, best_gpu['id'])
        
        return {
            'status': 'scheduled',
            'job_id': container.id,
            'gpu_id': best_gpu['id'],
            'estimated_completion': self._estimate_completion_time(job_request)
        }
    
    def _select_best_gpu(self, required_memory: int, required_compute: int) -> Optional[Dict]:
        """최적 GPU 선택 알고리즘"""
        available_gpus = [
            gpu for gpu in self.gpu_nodes 
            if gpu['free_memory'] >= required_memory and gpu['utilization'] < 80
        ]
        
        if not available_gpus:
            return None
        
        # 메모리 여유도와 사용률을 고려한 점수 계산
        def calculate_score(gpu):
            memory_score = gpu['free_memory'] / gpu['total_memory']
            utilization_score = (100 - gpu['utilization']) / 100
            return memory_score * 0.6 + utilization_score * 0.4
        
        return max(available_gpus, key=calculate_score)
    
    async def _run_container(self, job_request: Dict, gpu_id: int):
        """GPU 컨테이너 실행"""
        container_config = {
            'image': job_request['image'],
            'command': job_request['command'],
            'environment': {
                'CUDA_VISIBLE_DEVICES': str(gpu_id),
                'NVIDIA_VISIBLE_DEVICES': str(gpu_id)
            },
            'volumes': {
                '/nas/shared': {'bind': '/data', 'mode': 'rw'},
                '/nas/models': {'bind': '/models', 'mode': 'ro'}
            },
            'runtime': 'nvidia',
            'detach': True
        }
        
        container = self.client.containers.run(**container_config)
        return container

# 사용 예시
async def main():
    manager = GPUResourceManager()
    
    job_request = {
        'image': 'tensorflow/tensorflow:latest-gpu',
        'command': 'python /data/train.py',
        'memory_gb': 8,
        'compute_units': 1
    }
    
    result = await manager.schedule_job(job_request)
    print(f"Job scheduled: {result}")

if __name__ == "__main__":
    asyncio.run(main())
```

## Kubernetes 기반 GPU 클러스터

### GPU Operator 설치
```bash
# NVIDIA GPU Operator 설치
helm repo add nvidia https://nvidia.github.io/gpu-operator
helm repo update

helm install gpu-operator nvidia/gpu-operator \
  --namespace gpu-operator-resources \
  --create-namespace \
  --set driver.enabled=true
```

### GPU 워크로드 배포
```yaml
# gpu-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gpu-training-job
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gpu-training
  template:
    metadata:
      labels:
        app: gpu-training
    spec:
      containers:
      - name: training-container
        image: tensorflow/tensorflow:latest-gpu
        resources:
          limits:
            nvidia.com/gpu: 1
          requests:
            nvidia.com/gpu: 1
        volumeMounts:
        - name: shared-data
          mountPath: /data
        - name: model-storage
          mountPath: /models
      volumes:
      - name: shared-data
        nfs:
          server: 192.168.1.100
          path: /srv/nfs/shared
      - name: model-storage
        nfs:
          server: 192.168.1.100
          path: /srv/nfs/models
```

### GPU 리소스 모니터링
```yaml
# gpu-monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gpu-monitoring-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'nvidia-dcgm'
      static_configs:
      - targets: ['localhost:9400']
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

## 성능 최적화 및 모니터링

### GPU 사용률 모니터링
```python
# GPU 모니터링 스크립트
import time
import json
import nvidia_ml_py3 as nvml
from datetime import datetime

class GPUMonitor:
    def __init__(self):
        nvml.nvmlInit()
        self.device_count = nvml.nvmlDeviceGetCount()
    
    def get_gpu_metrics(self):
        metrics = []
        
        for i in range(self.device_count):
            handle = nvml.nvmlDeviceGetHandleByIndex(i)
            
            # 기본 정보
            name = nvml.nvmlDeviceGetName(handle).decode('utf-8')
            memory_info = nvml.nvmlDeviceGetMemoryInfo(handle)
            utilization = nvml.nvmlDeviceGetUtilizationRates(handle)
            temperature = nvml.nvmlDeviceGetTemperature(handle, nvml.NVML_TEMPERATURE_GPU)
            power_usage = nvml.nvmlDeviceGetPowerUsage(handle) / 1000.0  # mW to W
            
            metrics.append({
                'gpu_id': i,
                'name': name,
                'memory_total': memory_info.total,
                'memory_used': memory_info.used,
                'memory_free': memory_info.free,
                'memory_utilization': (memory_info.used / memory_info.total) * 100,
                'gpu_utilization': utilization.gpu,
                'memory_bandwidth_utilization': utilization.memory,
                'temperature': temperature,
                'power_usage': power_usage,
                'timestamp': datetime.now().isoformat()
            })
        
        return metrics
    
    def monitor_continuous(self, interval=5):
        """지속적 모니터링"""
        while True:
            metrics = self.get_gpu_metrics()
            
            for metric in metrics:
                print(f"GPU {metric['gpu_id']}: "
                      f"Util={metric['gpu_utilization']}%, "
                      f"Mem={metric['memory_utilization']:.1f}%, "
                      f"Temp={metric['temperature']}°C, "
                      f"Power={metric['power_usage']:.1f}W")
            
            time.sleep(interval)

# 사용 예시
if __name__ == "__main__":
    monitor = GPUMonitor()
    monitor.monitor_continuous()
```

### 스토리지 성능 최적화
```bash
# ZFS 성능 튜닝
echo 'vfs.zfs.arc_max="8G"' >> /etc/sysctl.conf
echo 'vfs.zfs.arc_min="2G"' >> /etc/sysctl.conf

# NFS 성능 최적화
echo "rsize=1048576,wsize=1048576,hard,intr,tcp" >> /etc/fstab

# SSD 캐시 설정 (bcache)
make-bcache -B /dev/sdb -C /dev/nvme0n1p1
echo /dev/bcache0 >> /etc/bcache/bcache.conf
```

## 보안 고려사항

### 컨테이너 보안
```bash
# 비특권 컨테이너 실행
docker run --user 1000:1000 --security-opt=no-new-privileges tensorflow/tensorflow:latest-gpu

# 리소스 제한
docker run --memory=8g --cpus=4 --gpus=1 training-image

# 네트워크 격리
docker network create --driver bridge isolated-gpu-network
```

### 접근 제어
```python
# JWT 기반 인증
import jwt
from datetime import datetime, timedelta

class GPUAccessControl:
    def __init__(self, secret_key):
        self.secret_key = secret_key
    
    def generate_token(self, user_id, gpu_quota):
        payload = {
            'user_id': user_id,
            'gpu_quota': gpu_quota,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_token(self, token):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
```

## 실무 면접 예상 질문

### 기술적 질문
1. **"GPU 가상화와 컨테이너 기반 GPU 공유의 차이점은?"**
   - vGPU vs Docker GPU 런타임
   - 성능 오버헤드 비교
   - 격리 수준의 차이

2. **"NAS에서 RAID 5와 ZFS의 장단점은?"**
   - 데이터 보호 메커니즘
   - 성능 특성
   - 복구 시간 비교

3. **"GPU 메모리 부족 시 어떻게 대응하시겠습니까?"**
   - 메모리 최적화 기법
   - 모델 분할 전략
   - 스와핑 메커니즘

### 실무 시나리오 질문
1. **"여러 사용자가 동시에 GPU를 요청할 때 스케줄링 전략은?"**
2. **"NAS 스토리지 성능이 병목이 될 때 해결 방법은?"**
3. **"GPU 노드 장애 시 작업 연속성을 어떻게 보장하시겠습니까?"**

### 프로젝트 경험 어필 포인트
- **실무 구현**: GPU 공유 시스템 직접 구축
- **인프라 설계**: NAS 기반 스토리지 아키텍처
- **성능 최적화**: 리소스 효율성 고려
- **확장성**: 클러스터 환경 대응 능력
