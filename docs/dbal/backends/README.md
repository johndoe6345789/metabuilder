# DBAL Backends

## Overview
Database backend implementations for different database systems.

## Location
[/dbal/backends/](/dbal/backends/)

## Backend Implementations

### Prisma Backend
- **Path**: [/dbal/backends/prisma/](/dbal/backends/prisma/)
- **Purpose**: Prisma ORM integration and Postgres/MySQL support
- **Features**: Query building, schema management, migrations

### SQLite Backend
- **Path**: [/dbal/backends/sqlite/](/dbal/backends/sqlite/)
- **Purpose**: SQLite database backend implementation
- **Features**: Lightweight, embedded database support

## Usage

Each backend provides a consistent interface for database operations while handling backend-specific implementations.

## Configuration

Database backend selection is configured through environment variables and configuration files.

## Related Documentation
- [Database Layer](/docs/database)
- [DBAL Architecture](/docs/dbal)
- [Prisma Documentation](https://www.prisma.io/docs/)
