from flask import Flask, jsonify, request
from flask_cors import CORS
import docker
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Simple in-memory session storage (in production, use proper session management)
sessions = {}

# Default credentials (should be environment variables in production)
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')

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

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        # Create a simple session token (in production, use JWT or proper session management)
        session_token = f"session_{username}_{datetime.now().timestamp()}"
        sessions[session_token] = {
            'username': username,
            'created_at': datetime.now()
        }
        return jsonify({
            'success': True,
            'token': session_token,
            'username': username
        })
    
    return jsonify({
        'success': False,
        'message': 'Invalid credentials'
    }), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user"""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token in sessions:
            del sessions[token]
    
    return jsonify({'success': True})

@app.route('/api/containers', methods=['GET'])
def get_containers():
    """Get list of all containers"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    
    token = auth_header.split(' ')[1]
    if token not in sessions:
        return jsonify({'error': 'Invalid session'}), 401
    
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
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    
    token = auth_header.split(' ')[1]
    if token not in sessions:
        return jsonify({'error': 'Invalid session'}), 401
    
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
