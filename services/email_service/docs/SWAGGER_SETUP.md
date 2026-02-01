# Swagger UI Setup Guide

Guide for integrating Swagger UI into the email service for interactive API documentation.

## Option 1: Flask-Flasgger (Recommended for Development)

Quick and easy integration with Flask app.

### Installation

```bash
pip install flasgger flask-cors pyyaml
```

### Integration

Update `app.py`:

```python
from flasgger import Swagger
import yaml

app = Flask(__name__)

# Configure Swagger
swagger = Swagger(
    app,
    config={
        'headers': [],
        'specs': [
            {
                'endpoint': 'apispec',
                'route': '/apispec.json',
                'rule_filter': lambda rule: True,
                'model_filter': lambda tag: True,
            }
        ],
        'static_url_path': '/flasgger_static',
        'specs_route': '/api/docs',
        'title': 'Email Service API',
        'uiversion': 3,
        'version': '1.0.0',
        'description': 'Production-grade email service REST API',
        'termsOfService': 'https://example.com/terms',
        'contact': {
            'name': 'MetaBuilder Team',
            'url': 'https://github.com/metabuilder/emailclient'
        },
        'license': {
            'name': 'Apache 2.0',
            'url': 'https://www.apache.org/licenses/LICENSE-2.0.html'
        }
    }
)

# Load OpenAPI spec
def load_openapi_spec():
    try:
        with open('openapi.yaml', 'r') as f:
            spec = yaml.safe_load(f)
            return spec
    except Exception as e:
        print(f"Warning: Could not load openapi.yaml: {e}")
        return None

# Register OpenAPI spec
openapi_spec = load_openapi_spec()
if openapi_spec:
    app.config['SWAGGER'] = openapi_spec
```

### Access

Navigate to: `http://localhost:5000/api/docs`

### Custom Styling

Add to Flask config:

```python
swagger.template = {
    'swagger': '3.0.3',
    'info': {
        'title': 'Email Service API',
        'version': '1.0.0'
    },
    'servers': [
        {'url': 'http://localhost:5000', 'description': 'Development'},
        {'url': 'https://api.example.com', 'description': 'Production'}
    ]
}
```

## Option 2: Docker Swagger UI Container

Run Swagger UI in separate container.

### Docker Compose Setup

Add to `docker-compose.yml`:

```yaml
services:
  swagger-ui:
    image: swaggerapi/swagger-ui:latest
    container_name: swagger-ui
    ports:
      - "8081:8080"
    environment:
      SWAGGER_JSON: /openapi.yaml
      URL: /openapi.yaml
      URLS: |
        [
          {
            "url": "http://localhost:5000/api/docs",
            "name": "Email Service API"
          }
        ]
    volumes:
      - ./openapi.yaml:/openapi.yaml:ro
    depends_on:
      - email_service
    networks:
      - email_network

  email_service:
    build: .
    container_name: email_service
    ports:
      - "5000:5000"
    environment:
      FLASK_ENV: development
      DATABASE_URL: postgresql://user:password@postgres:5432/email_service
      CELERY_BROKER_URL: redis://redis:6379/0
    depends_on:
      - postgres
      - redis
    networks:
      - email_network
```

### Run

```bash
docker-compose up swagger-ui email_service
```

Access at: `http://localhost:8081`

## Option 3: Standalone HTML File

Generate standalone Swagger UI that works without server.

### Create `swagger-ui.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email Service API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
  <style>
    body {
      margin: 0;
      background: #fafafa;
    }
    .topbar {
      background-color: #1f6feb;
      color: #fff;
      padding: 20px;
    }
    .topbar h1 {
      margin: 0;
      font-size: 24px;
    }
    .topbar p {
      margin: 5px 0 0 0;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <h1>📧 Email Service API</h1>
    <p>Production-grade REST API for email account management</p>
  </div>
  <div id="swagger-ui"></div>

  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "./openapi.yaml",  // Local spec file
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        tryItOutEnabled: true,
        requestInterceptor: (request) => {
          // Auto-inject JWT token if available
          const token = localStorage.getItem('jwt_token')
          if (token && !request.headers['Authorization']) {
            request.headers['Authorization'] = `Bearer ${token}`
          }
          return request
        }
      })
      window.ui = ui
    }
  </script>
</body>
</html>
```

### Usage

Place `swagger-ui.html` and `openapi.yaml` in same directory, open `swagger-ui.html` in browser.

### Add Authentication Token

Add form to page:

```html
<div style="margin: 20px; padding: 20px; background: #fff; border-radius: 4px;">
  <h3>Authentication</h3>
  <input
    type="password"
    id="jwt-token"
    placeholder="Paste JWT token here"
    style="width: 100%; padding: 10px; margin: 10px 0;"
  >
  <button onclick="saveToken()" style="padding: 10px 20px; background: #1f6feb; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
    Save Token
  </button>
</div>

<script>
function saveToken() {
  const token = document.getElementById('jwt-token').value
  localStorage.setItem('jwt_token', token)
  alert('Token saved. Swagger UI will use it for requests.')
}

window.addEventListener('load', () => {
  const token = localStorage.getItem('jwt_token')
  if (token) {
    document.getElementById('jwt-token').value = token
  }
})
</script>
```

## Option 4: nginx with Static Files

Serve Swagger UI via nginx.

### nginx Configuration

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;

    # Serve Swagger UI
    location /api/docs/ {
        alias /var/www/swagger-ui/;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Serve OpenAPI spec
    location /api/openapi.yaml {
        alias /var/www/openapi.yaml;
        add_header Content-Type 'text/yaml';
    }

    # Proxy to email service
    location /api/ {
        proxy_pass http://email_service:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Pass through CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }
}
```

### Docker Setup

```dockerfile
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY swagger-ui/ /var/www/swagger-ui/
COPY openapi.yaml /var/www/openapi.yaml

EXPOSE 80
```

Run:

```bash
docker build -t email-api-docs .
docker run -p 8080:80 email-api-docs
```

Access at: `http://localhost:8080/api/docs/`

## Option 5: GitHub Pages

Publish API docs to GitHub Pages.

### Setup

1. Create `docs/` directory in repo root
2. Place `swagger-ui.html` and `openapi.yaml` in `docs/`
3. Update GitHub Pages settings to serve from `docs/` folder
4. Docs available at: `https://username.github.io/emailclient/docs/`

### Modify `swagger-ui.html` for GitHub Pages

Change URL path:

```javascript
url: "./openapi.yaml",  // Relative path for GitHub Pages
```

### Enable in GitHub

1. Go to repository settings
2. Find "Pages" section
3. Select "Deploy from a branch"
4. Choose "main" branch and "docs/" folder
5. Save and wait for build

## Option 6: ReDoc (Alternative UI)

Beautiful documentation with built-in search.

### Install

```bash
npm install redoc redoc-cli
```

### Usage

Create `redoc.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Email Service API</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <redoc spec-url='./openapi.yaml'
    suppress-warnings
    no-auto-auth
    hide-hostname
  ></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
</body>
</html>
```

Access with local server:

```bash
python -m http.server 8000
# Visit http://localhost:8000/redoc.html
```

### Generate Static HTML

```bash
redoc-cli bundle openapi.yaml -o redoc.html
```

## Securing Swagger UI

### Disable in Production

Add to `app.py`:

```python
import os

if os.getenv('FLASK_ENV') == 'production':
    # Disable Swagger UI in production
    @app.route('/api/docs')
    def docs_forbidden():
        return 'Not Found', 404
else:
    # Enable Swagger UI in development
    swagger = Swagger(app)
```

### Password Protection

Use HTTP Basic Auth:

```python
from functools import wraps
from flask import request, abort

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or auth.password != os.getenv('SWAGGER_PASSWORD'):
            abort(401)
        return f(*args, **kwargs)
    return decorated

@app.route('/api/docs')
@require_auth
def swagger_ui():
    return send_file('swagger-ui.html')
```

### IP Whitelisting

```python
def is_ip_allowed(request):
    allowed_ips = os.getenv('SWAGGER_IPS', '127.0.0.1').split(',')
    return request.remote_addr in allowed_ips

@app.route('/api/docs')
def swagger_ui():
    if not is_ip_allowed(request):
        abort(403)
    return send_file('swagger-ui.html')
```

## Testing with Swagger UI

### Manual Testing

1. Open Swagger UI
2. Click on endpoint
3. Click "Try it out"
4. Fill in parameters/body
5. Click "Execute"
6. View response

### Using Test Token

1. Paste JWT token in auth form
2. Swagger UI automatically includes in headers
3. All requests will use token

### Debugging Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Execute request in Swagger UI
4. Click request in Network tab
5. View headers and response

## Performance Optimization

### Enable Caching

Add to `app.py`:

```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@app.route('/api/docs')
@cache.cached(timeout=3600)
def swagger_ui():
    return send_file('swagger-ui.html')

@app.route('/apispec.json')
@cache.cached(timeout=3600)
def get_api_spec():
    return jsonify(app.config.get('SWAGGER', {}))
```

### CDN Delivery

Use CloudFront to cache and serve Swagger UI files:

```bash
# Create CloudFront distribution for S3 bucket containing docs
aws s3 cp swagger-ui.html s3://my-bucket/docs/
aws s3 cp openapi.yaml s3://my-bucket/docs/

# Distribution URL: https://d123456.cloudfront.net/docs/
```

## Troubleshooting

### Issue: CORS errors

**Solution**: Enable CORS in Flask:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### Issue: Token not being sent

**Solution**: Check localStorage:

```javascript
// In browser console
localStorage.getItem('jwt_token')  // Should return token
```

### Issue: Old cached version

**Solution**: Clear browser cache or disable caching:

```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

### Issue: Large OpenAPI spec loading slowly

**Solution**: Split spec into multiple files:

```yaml
openapi: 3.0.3
components:
  schemas:
    accounts:
      $ref: './schemas/accounts.yaml'
    messages:
      $ref: './schemas/messages.yaml'
```

## References

- [Swagger UI Official Docs](https://swagger.io/tools/swagger-ui/)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [ReDoc Documentation](https://redoc.ly/)
- [Flasgger GitHub](https://github.com/flasgger/flasgger)

---

For more information, see the main [Phase 8 OpenAPI Documentation](../PHASE_8_OPENAPI_DOCUMENTATION.md).
