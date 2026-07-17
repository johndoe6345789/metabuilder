# MetaBuilder Media Daemon

A C++ Docker daemon for media processing, radio streaming, and TV channel simulation with a modular plugin architecture.

## Features

### 🎬 Job Queue System
- Video transcoding (H.264, H.265, VP9, AV1)
- Audio transcoding (MP3, AAC, FLAC, Opus)
- Document conversion (PDF, Office formats)
- Image processing (resize, convert, optimize)
- Priority queuing with configurable workers

### 📻 Radio Streaming
- Live audio streaming with multiple quality levels
- Playlist scheduling and auto-DJ
- Crossfading and audio normalization
- Metadata injection (artist, title, album art)
- Icecast/Shoutcast compatible output

### 📺 TV Channel Simulation
- Multi-channel scheduling system
- EPG (Electronic Program Guide) generation
- Bumpers, commercials, and interstitials
- Live-to-VOD and VOD-to-Live workflows
- HLS/DASH output for web players

### 🔌 Plugin Architecture
- Dynamic plugin loading (.so/.dll)
- Hot-reload support in development mode
- Plugin API for custom processors
- Built-in plugins: FFmpeg, ImageMagick, Pandoc

### 🔗 DBAL Integration
- Job status notifications to users
- Progress tracking in real-time
- User permission checks
- Multi-tenant isolation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Media Daemon                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  HTTP API   │  │  WebSocket  │  │   gRPC      │         │
│  │  (Drogon)   │  │  (Live)     │  │  (Internal) │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         └────────────────┼────────────────┘                 │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   Core Engine                          │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │ │
│  │  │ Job     │  │ Radio   │  │ TV      │  │ Plugin  │  │ │
│  │  │ Queue   │  │ Engine  │  │ Engine  │  │ Manager │  │ │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  │ │
│  └───────┼────────────┼────────────┼────────────┼───────┘ │
│          └────────────┴────────────┴────────────┘          │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                  Plugin System                         │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │ │
│  │  │FFmpeg  │ │ImageMag│ │Pandoc  │ │Custom  │         │ │
│  │  │Plugin  │ │Plugin  │ │Plugin  │ │Plugins │         │ │
│  │  └────────┘ └────────┘ └────────┘ └────────┘         │ │
│  └───────────────────────────────────────────────────────┘ │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              DBAL Client (Notifications)               │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Build
docker build -t metabuilder/media-daemon -f Dockerfile .

# Run
docker run -d \
  -p 8090:8090 \
  -v /media:/data/media \
  -e DBAL_URL=http://dbal:8080 \
  metabuilder/media-daemon
```

## API Endpoints

### Job Queue
- `POST /api/jobs` - Submit a new job
- `GET /api/jobs/:id` - Get job status
- `GET /api/jobs` - List jobs (filtered by user/tenant)
- `DELETE /api/jobs/:id` - Cancel a job

### Radio
- `POST /api/radio/channels` - Create radio channel
- `GET /api/radio/channels/:id/stream` - Get stream URL
- `POST /api/radio/channels/:id/playlist` - Update playlist
- `GET /api/radio/channels/:id/now-playing` - Current track info

### TV Channels
- `POST /api/tv/channels` - Create TV channel
- `GET /api/tv/channels/:id/schedule` - Get EPG
- `POST /api/tv/channels/:id/schedule` - Update schedule
- `GET /api/tv/channels/:id/stream.m3u8` - HLS playlist

### Plugins
- `GET /api/plugins` - List loaded plugins
- `POST /api/plugins/:id/reload` - Hot-reload plugin (dev mode)

## Configuration

Runtime configuration is environment-driven. Run `media_daemon --help` for the
supported variables and command-line overrides. The file under `config/` is a
legacy reference and is not read by the daemon.
