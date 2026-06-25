/**
 * Tests for dbUrlUtils - build database connection URLs
 */

import { buildUrl, DEFAULT_PORTS } from '../dbUrlUtils'

describe('DEFAULT_PORTS', () => {
  it('should have postgres port 5432', () => {
    expect(DEFAULT_PORTS.postgres).toBe('5432')
  })

  it('should have mysql port 3306', () => {
    expect(DEFAULT_PORTS.mysql).toBe('3306')
  })

  it('should have mongodb port 27017', () => {
    expect(DEFAULT_PORTS.mongodb).toBe('27017')
  })

  it('should have redis port 6379', () => {
    expect(DEFAULT_PORTS.redis).toBe('6379')
  })

  it('should have elasticsearch port 9200', () => {
    expect(DEFAULT_PORTS.elasticsearch).toBe('9200')
  })

  it('should have cockroachdb port 26257', () => {
    expect(DEFAULT_PORTS.cockroachdb).toBe('26257')
  })

  it('should have cassandra port 9042', () => {
    expect(DEFAULT_PORTS.cassandra).toBe('9042')
  })

  it('should have surrealdb port 8000', () => {
    expect(DEFAULT_PORTS.surrealdb).toBe('8000')
  })
})

describe('buildUrl', () => {
  describe('sqlite adapter', () => {
    it('should build sqlite URL with path', () => {
      const url = buildUrl('sqlite', { path: '/data/db.sqlite' })
      expect(url).toBe('sqlite:///data/db.sqlite')
    })

    it('should use :memory: when no path given', () => {
      const url = buildUrl('sqlite', {})
      expect(url).toBe('sqlite://:memory:')
    })
  })

  describe('mongodb adapter', () => {
    it('should use connectionString if provided', () => {
      const url = buildUrl('mongodb', { connectionString: 'mongodb://user:pass@host/db' })
      expect(url).toBe('mongodb://user:pass@host/db')
    })

    it('should build default mongodb URL without connectionString', () => {
      const url = buildUrl('mongodb', { database: 'mydb' })
      expect(url).toBe('mongodb://localhost:27017/mydb')
    })

    it('should use metabuilder as default database', () => {
      const url = buildUrl('mongodb', {})
      expect(url).toBe('mongodb://localhost:27017/metabuilder')
    })
  })

  describe('postgres adapter', () => {
    it('should build postgres URL with all fields', () => {
      const url = buildUrl('postgres', {
        user: 'admin',
        password: 'secret',
        host: 'db.example.com',
        port: '5432',
        database: 'mydb',
      })
      expect(url).toBe('postgres://admin:secret@db.example.com:5432/mydb')
    })

    it('should use default port when not provided', () => {
      const url = buildUrl('postgres', {
        user: 'admin',
        host: 'localhost',
        database: 'mydb',
      })
      expect(url).toContain(':5432/')
    })

    it('should work without user/password', () => {
      const url = buildUrl('postgres', {
        host: 'localhost',
        database: 'testdb',
      })
      expect(url).toBe('postgres://localhost:5432/testdb')
    })

    it('should use localhost as default host', () => {
      const url = buildUrl('postgres', { database: 'db' })
      expect(url).toContain('localhost')
    })

    it('should use metabuilder as default database', () => {
      const url = buildUrl('postgres', {})
      expect(url).toContain('/metabuilder')
    })

    it('should include user but no password when password is empty', () => {
      const url = buildUrl('postgres', {
        user: 'admin',
        password: '',
        host: 'localhost',
        database: 'db',
      })
      expect(url).toContain('admin@')
      expect(url).not.toContain('admin:@')
    })
  })

  describe('mysql adapter', () => {
    it('should build mysql URL with default port', () => {
      const url = buildUrl('mysql', { host: 'localhost', database: 'app' })
      expect(url).toContain(':3306/')
    })
  })

  describe('redis adapter', () => {
    it('should build redis URL with default port', () => {
      const url = buildUrl('redis', {})
      expect(url).toContain(':6379/')
    })
  })

  describe('unknown adapter', () => {
    it('should build URL for unknown adapter without default port', () => {
      const url = buildUrl('custom-db', { host: 'host', database: 'db' })
      expect(url).toContain('custom-db://')
      expect(url).toContain('/db')
    })
  })
})
