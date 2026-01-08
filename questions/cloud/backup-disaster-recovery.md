---
question: "클라우드 환경에서 백업 전략과 재해 복구(DR) 계획을 수립하는 방법, 그리고 RTO/RPO 개념을 설명해주세요."
shortAnswer: "백업은 3-2-1 전략(3개 복사본, 2개 매체, 1개 오프사이트)을 사용하고, DR은 Hot/Warm/Cold 방식으로 구분됩니다. RTO는 복구 목표 시간, RPO는 복구 목표 시점으로 비즈니스 요구사항에 따라 결정됩니다."
---

# 백업 및 재해 복구 (Backup & Disaster Recovery)

## 백업 전략

### 3-2-1 백업 규칙
- **3개의 복사본**: 원본 + 백업 2개
- **2개의 다른 매체**: 로컬 디스크 + 클라우드/테이프
- **1개의 오프사이트**: 물리적으로 분리된 위치

```bash
# 백업 전략 예시
원본 데이터 (프로덕션 서버)
├── 로컬 백업 (같은 데이터센터)
├── 원격 백업 (다른 지역 클라우드)
└── 아카이브 (장기 보관용)
```

### 백업 유형

#### 1. 전체 백업 (Full Backup)
```bash
# 전체 데이터베이스 백업
mysqldump -u root -p --all-databases > full_backup_$(date +%Y%m%d).sql

# 파일 시스템 전체 백업
tar -czf /backup/full_backup_$(date +%Y%m%d).tar.gz /var/www/
```
- **장점**: 복구 속도 빠름, 단순함
- **단점**: 시간과 저장공간 많이 소모

#### 2. 증분 백업 (Incremental Backup)
```bash
# rsync를 이용한 증분 백업
rsync -av --delete /var/www/ /backup/incremental/
```
- **장점**: 빠른 백업, 저장공간 효율적
- **단점**: 복구 시 여러 백업 파일 필요

#### 3. 차등 백업 (Differential Backup)
```bash
# 마지막 전체 백업 이후 변경된 파일만
find /var/www -newer /backup/last_full_backup.timestamp -exec cp {} /backup/differential/ \;
```
- **장점**: 증분보다 복구 빠름
- **단점**: 시간이 지날수록 백업 크기 증가

## AWS 백업 서비스

### EBS 스냅샷
```bash
# EBS 스냅샷 생성
aws ec2 create-snapshot \
    --volume-id vol-1234567890abcdef0 \
    --description "Daily backup $(date +%Y-%m-%d)"

# 스냅샷 자동화 (Lambda + CloudWatch Events)
import boto3
import datetime

def lambda_handler(event, context):
    ec2 = boto3.client('ec2')
    
    # 모든 EBS 볼륨 스냅샷 생성
    volumes = ec2.describe_volumes()['Volumes']
    
    for volume in volumes:
        volume_id = volume['VolumeId']
        
        response = ec2.create_snapshot(
            VolumeId=volume_id,
            Description=f'Auto backup {datetime.datetime.now()}'
        )
        
        print(f'Created snapshot {response["SnapshotId"]} for {volume_id}')
```

### RDS 자동 백업
```bash
# RDS 백업 설정
aws rds modify-db-instance \
    --db-instance-identifier mydb \
    --backup-retention-period 7 \
    --preferred-backup-window "03:00-04:00"

# 수동 스냅샷 생성
aws rds create-db-snapshot \
    --db-instance-identifier mydb \
    --db-snapshot-identifier mydb-snapshot-$(date +%Y%m%d)
```

### S3 백업 및 라이프사이클
```json
{
  "Rules": [
    {
      "ID": "BackupLifecycle",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

## 재해 복구 (Disaster Recovery)

### DR 전략 유형

#### 1. Hot Site (Active-Active)
```yaml
# 활성-활성 구성
Primary Site:
  - 실시간 서비스 제공
  - 모든 데이터 동기화

Secondary Site:
  - 실시간 서비스 제공
  - 로드 밸런싱으로 트래픽 분산
  - 즉시 페일오버 가능
```
- **RTO**: 거의 0분
- **RPO**: 거의 0분
- **비용**: 매우 높음

#### 2. Warm Site (Active-Passive)
```yaml
# 활성-대기 구성
Primary Site:
  - 실시간 서비스 제공

Secondary Site:
  - 최소한의 인프라 유지
  - 정기적 데이터 동기화
  - 장애 시 수동/자동 활성화
```
- **RTO**: 수분~수시간
- **RPO**: 분~시간 단위
- **비용**: 중간

#### 3. Cold Site (Backup Only)
```yaml
# 백업 전용 구성
Primary Site:
  - 실시간 서비스 제공

Secondary Site:
  - 백업 데이터만 저장
  - 장애 시 인프라 구축부터 시작
```
- **RTO**: 수시간~수일
- **RPO**: 시간~일 단위
- **비용**: 낮음

### AWS Multi-AZ 구성
```bash
# RDS Multi-AZ 설정
aws rds modify-db-instance \
    --db-instance-identifier mydb \
    --multi-az \
    --apply-immediately

# ELB를 통한 다중 AZ 로드 밸런싱
aws elbv2 create-load-balancer \
    --name my-load-balancer \
    --subnets subnet-12345678 subnet-87654321 \
    --security-groups sg-12345678
```

## RTO/RPO 개념

### RTO (Recovery Time Objective)
- **정의**: 장애 발생 후 서비스 복구까지 목표 시간
- **측정**: 장애 발생 시점 → 서비스 정상화 시점

```
장애 발생 -----> 복구 완료
     |              |
     |<---- RTO ---->|
```

### RPO (Recovery Point Objective)
- **정의**: 데이터 손실 허용 범위 (시간)
- **측정**: 마지막 백업 시점 → 장애 발생 시점

```
마지막 백업 -----> 장애 발생
     |              |
     |<---- RPO ---->|
```

### 비즈니스 요구사항별 RTO/RPO
```
Critical System:
- RTO: 15분 이내
- RPO: 5분 이내
- 전략: Hot Site + 실시간 복제

Important System:
- RTO: 4시간 이내
- RPO: 1시간 이내
- 전략: Warm Site + 정기 백업

Normal System:
- RTO: 24시간 이내
- RPO: 8시간 이내
- 전략: Cold Site + 일일 백업
```

## 실무 DR 시나리오

### 1. 웹 애플리케이션 DR 구성
```yaml
# Primary Region (Seoul)
Production:
  - EC2 instances (Auto Scaling)
  - RDS Primary (Multi-AZ)
  - ElastiCache
  - S3 (Cross-Region Replication)

# Secondary Region (Tokyo)
Disaster Recovery:
  - EC2 instances (Stopped)
  - RDS Read Replica
  - ElastiCache (Standby)
  - S3 (Replica)

# Failover Process
1. Route 53 Health Check 실패 감지
2. DNS 레코드를 DR 리전으로 변경
3. DR 리전의 EC2 인스턴스 시작
4. RDS Read Replica를 Primary로 승격
5. 애플리케이션 설정 업데이트
```

### 2. 데이터베이스 DR 스크립트
```bash
#!/bin/bash
# MySQL 마스터-슬레이브 페일오버 스크립트

MASTER_HOST="db-master.company.com"
SLAVE_HOST="db-slave.company.com"
VIP="10.0.1.100"

check_master() {
    mysql -h $MASTER_HOST -u monitor -p$MONITOR_PASS -e "SELECT 1" > /dev/null 2>&1
    return $?
}

promote_slave() {
    echo "마스터 장애 감지. 슬레이브를 마스터로 승격 중..."
    
    # 슬레이브에서 복제 중지
    mysql -h $SLAVE_HOST -u admin -p$ADMIN_PASS -e "STOP SLAVE;"
    
    # 읽기 전용 모드 해제
    mysql -h $SLAVE_HOST -u admin -p$ADMIN_PASS -e "SET GLOBAL read_only = OFF;"
    
    # VIP를 슬레이브로 이동
    ssh root@$SLAVE_HOST "ip addr add $VIP/24 dev eth0"
    
    # 애플리케이션에 알림
    curl -X POST http://app-server/api/db-failover \
         -H "Content-Type: application/json" \
         -d '{"new_master": "'$SLAVE_HOST'"}'
    
    echo "페일오버 완료"
}

# 메인 로직
if ! check_master; then
    promote_slave
else
    echo "마스터 정상 동작 중"
fi
```

### 3. 클라우드 DR 자동화
```python
import boto3
import json

class DisasterRecovery:
    def __init__(self, primary_region, dr_region):
        self.primary_region = primary_region
        self.dr_region = dr_region
        self.ec2_primary = boto3.client('ec2', region_name=primary_region)
        self.ec2_dr = boto3.client('ec2', region_name=dr_region)
        self.route53 = boto3.client('route53')
    
    def check_primary_health(self):
        """Primary 리전 상태 확인"""
        try:
            # ELB 상태 확인
            elb = boto3.client('elbv2', region_name=self.primary_region)
            response = elb.describe_target_health(
                TargetGroupArn='arn:aws:elasticloadbalancing:...'
            )
            
            healthy_targets = [
                target for target in response['TargetHealthDescriptions']
                if target['TargetHealth']['State'] == 'healthy'
            ]
            
            return len(healthy_targets) > 0
        except Exception as e:
            print(f"Primary 상태 확인 실패: {e}")
            return False
    
    def failover_to_dr(self):
        """DR 리전으로 페일오버"""
        print("DR 페일오버 시작...")
        
        # 1. DR 리전 인스턴스 시작
        self.start_dr_instances()
        
        # 2. RDS Read Replica 승격
        self.promote_rds_replica()
        
        # 3. Route 53 DNS 변경
        self.update_dns_records()
        
        # 4. 알림 발송
        self.send_notification("DR 페일오버 완료")
        
        print("DR 페일오버 완료")
    
    def start_dr_instances(self):
        """DR 인스턴스 시작"""
        response = self.ec2_dr.describe_instances(
            Filters=[
                {'Name': 'tag:Environment', 'Values': ['DR']},
                {'Name': 'instance-state-name', 'Values': ['stopped']}
            ]
        )
        
        instance_ids = []
        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                instance_ids.append(instance['InstanceId'])
        
        if instance_ids:
            self.ec2_dr.start_instances(InstanceIds=instance_ids)
            print(f"DR 인스턴스 시작: {instance_ids}")
    
    def promote_rds_replica(self):
        """RDS Read Replica 승격"""
        rds_dr = boto3.client('rds', region_name=self.dr_region)
        
        rds_dr.promote_read_replica(
            DBInstanceIdentifier='myapp-dr-replica'
        )
        print("RDS Read Replica 승격 완료")
    
    def update_dns_records(self):
        """Route 53 DNS 레코드 업데이트"""
        self.route53.change_resource_record_sets(
            HostedZoneId='Z123456789',
            ChangeBatch={
                'Changes': [{
                    'Action': 'UPSERT',
                    'ResourceRecordSet': {
                        'Name': 'app.company.com',
                        'Type': 'CNAME',
                        'TTL': 60,
                        'ResourceRecords': [
                            {'Value': 'dr-elb.ap-northeast-1.elb.amazonaws.com'}
                        ]
                    }
                }]
            }
        )
        print("DNS 레코드 업데이트 완료")

# 사용 예시
dr = DisasterRecovery('ap-northeast-2', 'ap-northeast-1')

if not dr.check_primary_health():
    dr.failover_to_dr()
```

## 백업 테스트 및 검증

### 백업 무결성 검증
```bash
#!/bin/bash
# 백업 파일 무결성 검증 스크립트

BACKUP_DIR="/backup"
LOG_FILE="/var/log/backup_verify.log"

verify_backup() {
    local backup_file=$1
    
    echo "[$(date)] 백업 검증 시작: $backup_file" >> $LOG_FILE
    
    # 파일 존재 확인
    if [ ! -f "$backup_file" ]; then
        echo "[$(date)] 오류: 백업 파일 없음 - $backup_file" >> $LOG_FILE
        return 1
    fi
    
    # 파일 크기 확인 (0바이트 체크)
    if [ ! -s "$backup_file" ]; then
        echo "[$(date)] 오류: 빈 백업 파일 - $backup_file" >> $LOG_FILE
        return 1
    fi
    
    # 압축 파일 무결성 확인
    if [[ $backup_file == *.gz ]]; then
        if ! gzip -t "$backup_file"; then
            echo "[$(date)] 오류: 압축 파일 손상 - $backup_file" >> $LOG_FILE
            return 1
        fi
    fi
    
    # SQL 백업 문법 확인
    if [[ $backup_file == *.sql ]]; then
        if ! mysql --execute="source $backup_file" test_db; then
            echo "[$(date)] 오류: SQL 백업 문법 오류 - $backup_file" >> $LOG_FILE
            return 1
        fi
    fi
    
    echo "[$(date)] 백업 검증 성공: $backup_file" >> $LOG_FILE
    return 0
}

# 모든 백업 파일 검증
for backup_file in $BACKUP_DIR/*.{sql,tar.gz}; do
    if [ -f "$backup_file" ]; then
        verify_backup "$backup_file"
    fi
done
```

### DR 테스트 계획
```yaml
DR Test Schedule:
  Monthly:
    - 백업 복원 테스트
    - RTO/RPO 측정
    - 문서 업데이트
  
  Quarterly:
    - 전체 DR 시나리오 테스트
    - 팀 훈련 실시
    - 프로세스 개선
  
  Annually:
    - 비즈니스 연속성 계획 검토
    - DR 전략 재평가
    - 예산 및 리소스 계획
```

## 신입 면접 핵심 포인트

### 1. 백업의 중요성
- **데이터 보호**: 하드웨어 장애, 인적 오류, 사이버 공격
- **비즈니스 연속성**: 서비스 중단 최소화
- **규정 준수**: 데이터 보관 의무

### 2. DR 전략 선택 기준
- **비즈니스 영향도**: 서비스 중단 시 손실 규모
- **예산**: DR 구축 및 운영 비용
- **기술적 복잡성**: 구현 및 관리 난이도

### 3. 실무 질문 대비
- "백업이 실패했을 때 어떻게 대응하나요?"
- "RTO 1시간을 만족하는 DR 전략은?"
- "클라우드와 온프레미스 백업의 차이점은?"

### 4. 모범 사례
- **정기적 테스트**: 백업 복원 및 DR 시나리오 테스트
- **문서화**: 절차서 작성 및 업데이트
- **자동화**: 수동 작업 최소화
- **모니터링**: 백업 상태 실시간 감시
