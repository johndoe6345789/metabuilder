from flask import Flask, jsonify, request
from flask_cors import CORS
import docker
import os
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

DBAL_URL = os.getenv('DBAL_ENDPOINT', os.getenv('DBAL_URL', 'http://localhost:8080'))
# Docker exec grants full host access via the mounted socket -- require an
# admin-tier role, not just any authenticated user.
ADMIN_ROLES = {'admin', 'god', 'supergod'}


def verify_admin_caller():
    """Verifies the caller's DBAL OIDC bearer token via /oidc/userinfo and
    requires an admin-tier role. Returns the username on success, or None
    (having already written the error response) on failure."""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ', 1)[1]
    try:
        resp = requests.get(
            f'{DBAL_URL}/oidc/userinfo',
            headers={'Authorization': f'Bearer {token}'},
            timeout=5,
        )
    except requests.RequestException:
        return None
    if resp.status_code != 200:
        return None
    claims = resp.json()
    if claims.get('role') not in ADMIN_ROLES:
        return None
    return claims.get('sub')


def get_docker_client():
    """Get Docker client"""
    try:
        return docker.from_env()
    except Exception as e:
        print(f"Error connecting to Docker: {e}")
        return None

def format_uptime(created_at):
    """Format container uptime"""
    created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    now = datetime.now(created.tzinfo)
    delta = now - created
    
    days = delta.days
    hours = delta.seconds // 3600
    minutes = (delta.seconds % 3600) // 60
    
    if days > 0:
        return f"{days}d {hours}h"
    elif hours > 0:
        return f"{hours}h {minutes}m"
    else:
        return f"{minutes}m"

@app.route('/api/containers', methods=['GET'])
def get_containers():
    """Get list of all containers"""
    if not verify_admin_caller():
        return jsonify({'error': 'Unauthorized'}), 401

    client = get_docker_client()
    if not client:
        return jsonify({'error': 'Cannot connect to Docker'}), 500
    
    try:
        containers = client.containers.list(all=True)
        container_list = []
        
        for container in containers:
            container_list.append({
                'id': container.short_id,
                'name': container.name,
                'image': container.image.tags[0] if container.image.tags else 'unknown',
                'status': container.status,
                'uptime': format_uptime(container.attrs['Created']) if container.status == 'running' else 'N/A'
            })
        
        return jsonify({'containers': container_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/containers/<container_id>/exec', methods=['POST'])
def exec_container(container_id):
    """Execute command in container"""
    if not verify_admin_caller():
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    command = data.get('command', '/bin/sh')
    
    client = get_docker_client()
    if not client:
        return jsonify({'error': 'Cannot connect to Docker'}), 500
    
    try:
        container = client.containers.get(container_id)
        exec_instance = container.exec_run(command, stdout=True, stderr=True, stdin=True, tty=True)
        
        return jsonify({
            'output': exec_instance.output.decode('utf-8') if exec_instance.output else '',
            'exit_code': exec_instance.exit_code
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
