from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import sqlite3
import json
import os

app = Flask(__name__)

ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '*')
if ALLOWED_ORIGINS == '*':
    CORS(app, 
         origins='*',
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=False)
else:
    origins_list = [origin.strip() for origin in ALLOWED_ORIGINS.split(',')]
    CORS(app, 
         origins=origins_list,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=True)

DATABASE_PATH = os.environ.get('DATABASE_PATH', '/app/data/snippets.db')
os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def check_and_migrate_schema():
    """Check if schema needs migration and perform it if necessary"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='namespaces'")
    namespaces_exists = cursor.fetchone() is not None
    
    cursor.execute("PRAGMA table_info(snippets)")
    columns = [row[1] for row in cursor.fetchall()]
    has_namespace_id = 'namespaceId' in columns
    
    if not namespaces_exists or not has_namespace_id:
        print("Schema migration needed - recreating tables with namespace support...")
        
        cursor.execute("DROP TABLE IF EXISTS snippets")
        cursor.execute("DROP TABLE IF EXISTS namespaces")
        
        cursor.execute('''
            CREATE TABLE namespaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                createdAt INTEGER NOT NULL,
                isDefault INTEGER DEFAULT 0
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE snippets (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                code TEXT NOT NULL,
                language TEXT NOT NULL,
                category TEXT NOT NULL,
                namespaceId TEXT,
                hasPreview INTEGER DEFAULT 0,
                functionName TEXT,
                inputParameters TEXT,
                createdAt INTEGER NOT NULL,
                updatedAt INTEGER NOT NULL,
                FOREIGN KEY (namespaceId) REFERENCES namespaces(id)
            )
        ''')
        
        cursor.execute('''
            INSERT INTO namespaces (id, name, createdAt, isDefault)
            VALUES ('default', 'Default', ?, 1)
        ''', (int(datetime.utcnow().timestamp() * 1000),))
        
        conn.commit()
        print("Schema migration completed")
    
    conn.close()

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS namespaces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            createdAt INTEGER NOT NULL,
            isDefault INTEGER DEFAULT 0
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS snippets (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            code TEXT NOT NULL,
            language TEXT NOT NULL,
            category TEXT NOT NULL,
            namespaceId TEXT,
            hasPreview INTEGER DEFAULT 0,
            functionName TEXT,
            inputParameters TEXT,
            createdAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL,
            FOREIGN KEY (namespaceId) REFERENCES namespaces(id)
        )
    ''')
    
    cursor.execute("SELECT COUNT(*) FROM namespaces WHERE isDefault = 1")
    default_count = cursor.fetchone()[0]
    
    if default_count == 0:
        cursor.execute('''
            INSERT INTO namespaces (id, name, createdAt, isDefault)
            VALUES ('default', 'Default', ?, 1)
        ''', (int(datetime.utcnow().timestamp() * 1000),))
    
    conn.commit()
    conn.close()
    
    check_and_migrate_schema()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/snippets', methods=['GET'])
def get_snippets():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM snippets ORDER BY updatedAt DESC')
        rows = cursor.fetchall()
        conn.close()
        
        snippets = []
        for row in rows:
            snippet = dict(row)
            if snippet.get('inputParameters'):
                try:
                    snippet['inputParameters'] = json.loads(snippet['inputParameters'])
                except:
                    snippet['inputParameters'] = None
            snippet['hasPreview'] = bool(snippet.get('hasPreview', 0))
            snippets.append(snippet)
        
        return jsonify(snippets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/snippets/<snippet_id>', methods=['GET'])
def get_snippet(snippet_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM snippets WHERE id = ?', (snippet_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({'error': 'Snippet not found'}), 404
        
        snippet = dict(row)
        if snippet.get('inputParameters'):
            try:
                snippet['inputParameters'] = json.loads(snippet['inputParameters'])
            except:
                snippet['inputParameters'] = None
        snippet['hasPreview'] = bool(snippet.get('hasPreview', 0))
        
        return jsonify(snippet)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/snippets', methods=['POST'])
def create_snippet():
    try:
        data = request.json
        conn = get_db()
        cursor = conn.cursor()
        
        input_params_json = json.dumps(data.get('inputParameters')) if data.get('inputParameters') else None
        
        created_at = data.get('createdAt')
        if isinstance(created_at, str):
            created_at = int(datetime.fromisoformat(created_at.replace('Z', '+00:00')).timestamp() * 1000)
        
        updated_at = data.get('updatedAt')
        if isinstance(updated_at, str):
            updated_at = int(datetime.fromisoformat(updated_at.replace('Z', '+00:00')).timestamp() * 1000)
        
        cursor.execute('''
            INSERT INTO snippets (id, title, description, code, language, category, namespaceId, hasPreview, functionName, inputParameters, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'],
            data['title'],
            data.get('description', ''),
            data['code'],
            data['language'],
            data.get('category', 'general'),
            data.get('namespaceId'),
            1 if data.get('hasPreview') else 0,
            data.get('functionName'),
            input_params_json,
            created_at,
            updated_at
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify(data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/snippets/<snippet_id>', methods=['PUT'])
def update_snippet(snippet_id):
    try:
        data = request.json
        conn = get_db()
        cursor = conn.cursor()
        
        input_params_json = json.dumps(data.get('inputParameters')) if data.get('inputParameters') else None
        
        updated_at = data.get('updatedAt')
        if isinstance(updated_at, str):
            updated_at = int(datetime.fromisoformat(updated_at.replace('Z', '+00:00')).timestamp() * 1000)
        
        cursor.execute('''
            UPDATE snippets
            SET title = ?, description = ?, code = ?, language = ?, category = ?, namespaceId = ?, hasPreview = ?, functionName = ?, inputParameters = ?, updatedAt = ?
            WHERE id = ?
        ''', (
            data['title'],
            data.get('description', ''),
            data['code'],
            data['language'],
            data.get('category', 'general'),
            data.get('namespaceId'),
            1 if data.get('hasPreview') else 0,
            data.get('functionName'),
            input_params_json,
            updated_at,
            snippet_id
        ))
        
        conn.commit()
        conn.close()
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Snippet not found'}), 404
        
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/snippets/<snippet_id>', methods=['DELETE'])
def delete_snippet(snippet_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM snippets WHERE id = ?', (snippet_id,))
        conn.commit()
        conn.close()
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Snippet not found'}), 404
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/namespaces', methods=['GET'])
def get_namespaces():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM namespaces ORDER BY isDefault DESC, name ASC')
        rows = cursor.fetchall()
        conn.close()
        
        namespaces = []
        for row in rows:
            namespace = dict(row)
            namespace['isDefault'] = bool(namespace.get('isDefault', 0))
            namespaces.append(namespace)
        
        return jsonify(namespaces)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/namespaces', methods=['POST'])
def create_namespace():
    try:
        data = request.json
        conn = get_db()
        cursor = conn.cursor()
        
        created_at = data.get('createdAt')
        if isinstance(created_at, str):
            created_at = int(datetime.fromisoformat(created_at.replace('Z', '+00:00')).timestamp() * 1000)
        
        cursor.execute('''
            INSERT INTO namespaces (id, name, createdAt, isDefault)
            VALUES (?, ?, ?, ?)
        ''', (
            data['id'],
            data['name'],
            created_at,
            1 if data.get('isDefault') else 0
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify(data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/namespaces/<namespace_id>', methods=['DELETE'])
def delete_namespace(namespace_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT isDefault FROM namespaces WHERE id = ?', (namespace_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return jsonify({'error': 'Namespace not found'}), 404
        
        if row['isDefault']:
            conn.close()
            return jsonify({'error': 'Cannot delete default namespace'}), 400
        
        cursor.execute('SELECT id FROM namespaces WHERE isDefault = 1')
        default_row = cursor.fetchone()
        default_id = default_row['id'] if default_row else 'default'
        
        cursor.execute('UPDATE snippets SET namespaceId = ? WHERE namespaceId = ?', (default_id, namespace_id))
        
        cursor.execute('DELETE FROM namespaces WHERE id = ?', (namespace_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/wipe', methods=['POST'])
def wipe_database():
    """Emergency endpoint to wipe and recreate the database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("DROP TABLE IF EXISTS snippets")
        cursor.execute("DROP TABLE IF EXISTS namespaces")
        
        conn.commit()
        conn.close()
        
        init_db()
        
        return jsonify({'success': True, 'message': 'Database wiped and recreated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=False)
