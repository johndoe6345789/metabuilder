import { describe, expect, it } from 'vitest'
import { generateFlaskApp } from './generateFlaskApp'
import type { FlaskConfig } from '@/types/project'

const minimalConfig: FlaskConfig = {
  blueprints: [],
  port: 5000,
  debug: false,
}

describe('generateFlaskApp', () => {
  it('generates app.py with Flask import', () => {
    const files = generateFlaskApp(minimalConfig)
    expect(files['app.py']).toBeDefined()
    expect(files['app.py']).toContain('from flask import Flask')
  })

  it('generates requirements.txt', () => {
    const files = generateFlaskApp(minimalConfig)
    expect(files['requirements.txt']).toContain('Flask>=3.0.0')
    expect(files['requirements.txt']).toContain('python-dotenv>=1.0.0')
  })

  it('generates .env file', () => {
    const files = generateFlaskApp(minimalConfig)
    expect(files['.env']).toContain('FLASK_APP=app.py')
    expect(files['.env']).toContain('FLASK_ENV=production')
  })

  it('.env has FLASK_ENV=development when debug=true', () => {
    const files = generateFlaskApp({ ...minimalConfig, debug: true })
    expect(files['.env']).toContain('FLASK_ENV=development')
    expect(files['app.py']).toContain('DEBUG') // config
  })

  it('generates README.md with project info', () => {
    const files = generateFlaskApp(minimalConfig)
    expect(files['README.md']).toContain('Flask API')
    expect(files['README.md']).toContain('pip install -r requirements.txt')
  })

  it('includes CORS import when corsOrigins provided', () => {
    const files = generateFlaskApp({ ...minimalConfig, corsOrigins: ['http://localhost:3000'] })
    expect(files['app.py']).toContain('from flask_cors import CORS')
    expect(files['requirements.txt']).toContain('Flask-CORS>=4.0.0')
  })

  it('does not include CORS when no corsOrigins', () => {
    const files = generateFlaskApp(minimalConfig)
    expect(files['app.py']).not.toContain('from flask_cors import CORS')
  })

  it('includes SQLAlchemy when databaseUrl provided', () => {
    const files = generateFlaskApp({ ...minimalConfig, databaseUrl: 'postgresql://localhost/db' })
    expect(files['app.py']).toContain('SQLALCHEMY_DATABASE_URI')
    expect(files['requirements.txt']).toContain('Flask-SQLAlchemy')
  })

  it('generates blueprint files for each blueprint', () => {
    const config: FlaskConfig = {
      ...minimalConfig,
      blueprints: [
        {
          id: 'bp1',
          name: 'Users',
          urlPrefix: '/users',
          description: 'User endpoints',
          endpoints: [
            {
              id: 'ep1',
              name: 'get users',
              description: 'List all users',
              method: 'GET',
              path: '/list',
            },
          ],
        },
      ],
    }
    const files = generateFlaskApp(config)
    expect(files['blueprints/users.py']).toBeDefined()
    expect(files['blueprints/__init__.py']).toBeDefined()
    expect(files['app.py']).toContain('from blueprints.users import users_bp')
    expect(files['app.py']).toContain('app.register_blueprint(users_bp)')
  })

  it('uses port in run command', () => {
    const files = generateFlaskApp({ ...minimalConfig, port: 8080 })
    expect(files['app.py']).toContain('port=8080')
  })

  it('README lists blueprints', () => {
    const config: FlaskConfig = {
      ...minimalConfig,
      blueprints: [
        {
          id: 'bp1',
          name: 'Auth',
          urlPrefix: '/auth',
          description: 'Auth blueprint',
          endpoints: [],
        },
      ],
    }
    const files = generateFlaskApp(config)
    expect(files['README.md']).toContain('Auth')
    expect(files['README.md']).toContain('/auth')
  })
})
