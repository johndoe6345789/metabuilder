# Projects Plugin

Workflow integration for MetaBuilder's standalone projects. This plugin provides workflow nodes to interact with all 15 standalone projects in the monorepo.

## Available Nodes

### CadQuery (3D CAD)
- `cadquery.execute` - Execute a CadQuery Python script
- `cadquery.box` - Create a 3D box
- `cadquery.cylinder` - Create a 3D cylinder

### Game Engine (C++ SDL3)
- `gameengine.build` - Build the SDL3 game engine
- `gameengine.run` - Run a game engine executable
- `gameengine.listPackages` - List available game engine packages

### Pastebin (Code Snippets)
- `pastebin.create` - Create a new code snippet
- `pastebin.get` - Get a paste by ID
- `pastebin.list` - List recent pastes

### PCB Generator
- `pcb.generate` - Execute a PCB generation script
- `pcb.createBoard` - Create a PCB with components and traces
- `pcb.listFootprints` - List available PCB footprints

### Docker (Container Management)
- `docker.listContainers` - List Docker containers
- `docker.listServices` - List Docker Swarm services
- `docker.run` - Run a Docker container
- `docker.stop` - Stop a Docker container
- `docker.scaleService` - Scale a Docker Swarm service
- `docker.deployStack` - Deploy a stack to Docker Swarm

### SMTP (Email Relay)
- `smtp.sendEmail` - Send an email via SMTP relay
- `smtp.status` - Check SMTP server status
- `smtp.start` - Start the SMTP relay server

### Mojo (Systems Programming)
- `mojo.run` - Run Mojo code directly
- `mojo.build` - Build Mojo file to native binary
- `mojo.runExample` - Run a Mojo example
- `mojo.listExamples` - List available Mojo examples

### PostgreSQL (Database Admin)
- `postgres.query` - Execute a SQL query and return results
- `postgres.execute` - Execute a SQL command
- `postgres.listTables` - List all tables in the database
- `postgres.describeTable` - Get table schema/columns
- `postgres.checkConnection` - Check database connection
- `postgres.backup` - Create a database backup

## Example Workflows

### Create 3D Model and Share

```json
{
  "version": "2.2.0",
  "name": "create-and-share-3d",
  "nodes": [
    {
      "id": "create-model",
      "type": "operation",
      "op": "cadquery.box",
      "params": {
        "length": 100,
        "width": 50,
        "height": 25,
        "outputPath": "/tmp/model.step"
      }
    },
    {
      "id": "share-model",
      "type": "operation",
      "op": "pastebin.create",
      "params": {
        "content": "{{ $nodes['create-model'].outputPath }}",
        "title": "3D Model Path",
        "language": "plaintext"
      }
    }
  ],
  "connections": [
    { "from": "create-model", "to": "share-model" }
  ]
}
```

### Deploy Container and Send Notification

```json
{
  "version": "2.2.0",
  "name": "deploy-and-notify",
  "nodes": [
    {
      "id": "deploy",
      "type": "operation",
      "op": "docker.run",
      "params": {
        "image": "nginx:latest",
        "name": "my-nginx",
        "ports": ["8080:80"],
        "detach": true
      }
    },
    {
      "id": "notify",
      "type": "operation",
      "op": "smtp.sendEmail",
      "params": {
        "from": "deploy@metabuilder.local",
        "to": "admin@example.com",
        "subject": "Container Deployed",
        "body": "Container {{ $nodes['deploy'].containerId }} is now running"
      }
    }
  ],
  "connections": [
    { "from": "deploy", "to": "notify" }
  ]
}
```

### Database Backup Workflow

```json
{
  "version": "2.2.0",
  "name": "daily-backup",
  "nodes": [
    {
      "id": "check-db",
      "type": "operation",
      "op": "postgres.checkConnection",
      "params": {
        "host": "localhost",
        "database": "myapp"
      }
    },
    {
      "id": "backup",
      "type": "operation",
      "op": "postgres.backup",
      "params": {
        "host": "localhost",
        "database": "myapp",
        "outputPath": "/backups/myapp-{{ $date }}.sql"
      }
    },
    {
      "id": "notify",
      "type": "operation",
      "op": "smtp.sendEmail",
      "params": {
        "from": "backup@metabuilder.local",
        "to": "dba@example.com",
        "subject": "Backup Complete",
        "body": "Database backup saved to {{ $nodes['backup'].backupPath }}"
      }
    }
  ],
  "connections": [
    { "from": "check-db", "to": "backup" },
    { "from": "backup", "to": "notify" }
  ]
}
```

## Requirements

Each plugin requires the corresponding project dependencies:

- **cadquery**: Python 3, CadQuery library
- **gameengine**: CMake, SDL3, C++ compiler
- **pastebin**: Pastebin service running (default: localhost:3001)
- **pcb**: Python 3, boardforge library
- **docker**: Docker CLI installed
- **smtp**: SMTP relay service or external SMTP server
- **mojo**: Mojo SDK installed
- **postgres**: PostgreSQL client (psql, pg_dump)
