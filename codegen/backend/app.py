from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime
from contextlib import contextmanager

app = Flask(__name__)

# CORS configuration for CapRover/Cloudflare deployment
# Allow requests from frontend domain
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
CORS(app, 
     resources={r"/api/*": {
         "origins": ALLOWED_ORIGINS,
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
         "expose_headers": ["Content-Type", "X-Total-Count"],
         "supports_credentials": True,
         "max_age": 3600
     }},
     supports_credentials=True)

DATABASE_PATH = os.environ.get('DATABASE_PATH', '/data/codeforge.db')
os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS storage (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')
        conn.execute('''
            CREATE INDEX IF NOT EXISTS idx_updated_at ON storage(updated_at)
        ''')
        conn.commit()

init_db()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/storage/keys', methods=['GET'])
def get_keys():
    try:
        with get_db() as conn:
            cursor = conn.execute('SELECT key FROM storage ORDER BY key')
            keys = [row['key'] for row in cursor.fetchall()]
        return jsonify({'keys': keys})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/storage/<key>', methods=['GET'])
def get_value(key):
    try:
        with get_db() as conn:
            cursor = conn.execute('SELECT value FROM storage WHERE key = ?', (key,))
            row = cursor.fetchone()
        
        if row is None:
            return jsonify({'error': 'Key not found'}), 404
        
        return jsonify({'value': json.loads(row['value'])})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/storage/<key>', methods=['PUT', 'POST'])
def set_value(key):
    try:
        data = request.get_json()
        if 'value' not in data:
            return jsonify({'error': 'Missing value field'}), 400
        
        value_json = json.dumps(data['value'])
        now = datetime.utcnow().isoformat()
        
        with get_db() as conn:
            cursor = conn.execute('SELECT key FROM storage WHERE key = ?', (key,))
            exists = cursor.fetchone() is not None
            
            if exists:
                conn.execute(
                    'UPDATE storage SET value = ?, updated_at = ? WHERE key = ?',
                    (value_json, now, key)
                )
            else:
                conn.execute(
                    'INSERT INTO storage (key, value, created_at, updated_at) VALUES (?, ?, ?, ?)',
                    (key, value_json, now, now)
                )
            conn.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/storage/<key>', methods=['DELETE'])
def delete_value(key):
    try:
        with get_db() as conn:
            cursor = conn.execute('DELETE FROM storage WHERE key = ?', (key,))
            conn.commit()
            
        if cursor.rowcount == 0:
            return jsonify({'error': 'Key not found'}), 404
            
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/storage/clear', methods=['POST'])
def clear_all():
    try:
        with get_db() as conn:
            conn.execute('DELETE FROM storage')
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/storage/export', methods=['GET'])
def export_data():
    try:
        with get_db() as conn:
            cursor = conn.execute('SELECT key, value FROM storage')
            data = {row['key']: json.loads(row['value']) for row in cursor.fetchall()}
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/storage/import', methods=['POST'])
def import_data():
    try:
        data = request.get_json()
        if not isinstance(data, dict):
            return jsonify({'error': 'Data must be an object'}), 400
        
        now = datetime.utcnow().isoformat()
        
        with get_db() as conn:
            for key, value in data.items():
                value_json = json.dumps(value)
                cursor = conn.execute('SELECT key FROM storage WHERE key = ?', (key,))
                exists = cursor.fetchone() is not None
                
                if exists:
                    conn.execute(
                        'UPDATE storage SET value = ?, updated_at = ? WHERE key = ?',
                        (value_json, now, key)
                    )
                else:
                    conn.execute(
                        'INSERT INTO storage (key, value, created_at, updated_at) VALUES (?, ?, ?, ?)',
                        (key, value_json, now, now)
                    )
            conn.commit()
        
        return jsonify({'success': True, 'imported': len(data)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/storage/stats', methods=['GET'])
def get_stats():
    try:
        with get_db() as conn:
            cursor = conn.execute('SELECT COUNT(*) as count FROM storage')
            count = cursor.fetchone()['count']
            
            cursor = conn.execute('SELECT SUM(LENGTH(value)) as total_size FROM storage')
            total_size = cursor.fetchone()['total_size'] or 0
        
        return jsonify({
            'total_keys': count,
            'total_size_bytes': total_size,
            'database_path': DATABASE_PATH
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('DEBUG', 'false').lower() == 'true')
