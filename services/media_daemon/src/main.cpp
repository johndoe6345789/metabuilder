#include <iostream>
#include <string>
#include <csignal>
#include <memory>
#include <fstream>

// Cross-platform signal handling
#ifdef _WIN32
    #include <windows.h>
    #ifndef SIGTERM
    #define SIGTERM SIGBREAK
    #endif
#endif

#include "media/server.hpp"

namespace {
    std::unique_ptr<media::Server> server_instance;
    
    void signal_handler(int signal) {
        if (signal == SIGINT || signal == SIGTERM) {
            std::cout << "\nShutting down Media Daemon..." << std::endl;
            if (server_instance) {
                server_instance->stop();
            }
        }
    }
    
    void print_banner() {
        std::cout << R"(
╔═══════════════════════════════════════════════════════════╗
║                    MetaBuilder Media Daemon                ║
║                         v1.0.0                            ║
╠═══════════════════════════════════════════════════════════╣
║  Job Queue    │ Video, Audio, Document, Image Processing  ║
║  Radio        │ Streaming, Auto-DJ, Crossfade             ║
║  TV Channels  │ Schedule, EPG, HLS/DASH Output            ║
║  Plugins      │ FFmpeg, ImageMagick, Pandoc, Custom       ║
╚═══════════════════════════════════════════════════════════╝
)" << std::endl;
    }
    
    void print_help(const char* program) {
        std::cout << "Usage: " << program << " [options]" << std::endl;
        std::cout << std::endl;
        std::cout << "Options:" << std::endl;
        std::cout << "  --config <file>    Configuration file (default: /etc/media-daemon/config.yaml)" << std::endl;
        std::cout << "  --bind <address>   Bind address (default: 0.0.0.0)" << std::endl;
        std::cout << "  --port <port>      Port number (default: 8090)" << std::endl;
        std::cout << "  --workers <n>      Number of HTTP workers (default: 4)" << std::endl;
        std::cout << "  --dbal-url <url>   DBAL daemon URL (default: http://localhost:8080)" << std::endl;
        std::cout << "  --plugin-dir <dir> Plugin directory (default: /plugins)" << std::endl;
        std::cout << "  --dev              Enable development mode (hot-reload, verbose logging)" << std::endl;
        std::cout << "  --daemon, -d       Run in daemon mode" << std::endl;
        std::cout << "  --help, -h         Show this help message" << std::endl;
        std::cout << std::endl;
        std::cout << "Environment variables:" << std::endl;
        std::cout << "  MEDIA_BIND_ADDRESS   Bind address" << std::endl;
        std::cout << "  MEDIA_PORT           Port number" << std::endl;
        std::cout << "  MEDIA_WORKERS        HTTP worker threads" << std::endl;
        std::cout << "  DBAL_URL             DBAL daemon URL" << std::endl;
        std::cout << "  DBAL_API_KEY         DBAL API key" << std::endl;
        std::cout << "  MEDIA_PLUGIN_DIR     Plugin directory" << std::endl;
        std::cout << "  MEDIA_DEV_MODE       Development mode (true/false)" << std::endl;
        std::cout << std::endl;
    }
    
    std::string get_env(const char* name, const std::string& default_value = "") {
        const char* value = std::getenv(name);
        return value ? value : default_value;
    }
    
    int get_env_int(const char* name, int default_value) {
        const char* value = std::getenv(name);
        if (value) {
            try {
                return std::stoi(value);
            } catch (...) {}
        }
        return default_value;
    }
    
    bool get_env_bool(const char* name, bool default_value = false) {
        const char* value = std::getenv(name);
        if (value) {
            std::string str = value;
            return str == "true" || str == "1" || str == "yes";
        }
        return default_value;
    }
}

int main(int argc, char* argv[]) {
    print_banner();
    
    // Register signal handlers
    std::signal(SIGINT, signal_handler);
    std::signal(SIGTERM, signal_handler);
    
    // Default configuration
    media::ServerConfig config;
    std::string config_file = "/etc/media-daemon/config.yaml";
    bool daemon_mode = false;
    
    // Load from environment variables
    config.bind_address = get_env("MEDIA_BIND_ADDRESS", "0.0.0.0");
    config.port = get_env_int("MEDIA_PORT", 8090);
    config.workers = get_env_int("MEDIA_WORKERS", 4);
    config.development_mode = get_env_bool("MEDIA_DEV_MODE", false);
    config.plugin_dir = get_env("MEDIA_PLUGIN_DIR", "/plugins");
    
    // DBAL settings
    config.dbal.url = get_env("DBAL_URL", "http://localhost:8080");
    config.dbal.api_key = get_env("DBAL_API_KEY", "");
    
    // Job queue settings
    config.job_queue.video_workers = get_env_int("MEDIA_VIDEO_WORKERS", 2);
    config.job_queue.audio_workers = get_env_int("MEDIA_AUDIO_WORKERS", 4);
    config.job_queue.document_workers = get_env_int("MEDIA_DOC_WORKERS", 4);
    config.job_queue.image_workers = get_env_int("MEDIA_IMAGE_WORKERS", 8);
    config.job_queue.temp_dir = get_env("MEDIA_TEMP_DIR", "/data/temp");
    config.job_queue.output_dir = get_env("MEDIA_OUTPUT_DIR", "/data/output");
    
    // Radio settings
    config.radio_enabled = get_env_bool("MEDIA_RADIO_ENABLED", true);
    config.radio.max_channels = get_env_int("MEDIA_RADIO_MAX_CHANNELS", 10);
    config.radio.hls_output_dir = get_env("MEDIA_RADIO_HLS_DIR", "/data/hls/radio");
    
    // TV settings
    config.tv_enabled = get_env_bool("MEDIA_TV_ENABLED", true);
    config.tv.max_channels = get_env_int("MEDIA_TV_MAX_CHANNELS", 5);
    config.tv.hls_output_dir = get_env("MEDIA_TV_HLS_DIR", "/data/hls/tv");
    
    // Parse command line arguments
    for (int i = 1; i < argc; i++) {
        std::string arg = argv[i];
        
        if (arg == "--config" && i + 1 < argc) {
            config_file = argv[++i];
        } else if (arg == "--bind" && i + 1 < argc) {
            config.bind_address = argv[++i];
        } else if (arg == "--port" && i + 1 < argc) {
            config.port = std::stoi(argv[++i]);
        } else if (arg == "--workers" && i + 1 < argc) {
            config.workers = std::stoi(argv[++i]);
        } else if (arg == "--dbal-url" && i + 1 < argc) {
            config.dbal.url = argv[++i];
        } else if (arg == "--plugin-dir" && i + 1 < argc) {
            config.plugin_dir = argv[++i];
        } else if (arg == "--dev") {
            config.development_mode = true;
            config.hot_reload = true;
        } else if (arg == "--daemon" || arg == "-d") {
            daemon_mode = true;
        } else if (arg == "--help" || arg == "-h") {
            print_help(argv[0]);
            return 0;
        } else {
            std::cerr << "Unknown option: " << arg << std::endl;
            print_help(argv[0]);
            return 1;
        }
    }
    
    // Print configuration summary
    std::cout << "Configuration:" << std::endl;
    std::cout << "  Bind Address: " << config.bind_address << std::endl;
    std::cout << "  Port: " << config.port << std::endl;
    std::cout << "  Workers: " << config.workers << std::endl;
    std::cout << "  DBAL URL: " << config.dbal.url << std::endl;
    std::cout << "  Plugin Dir: " << config.plugin_dir << std::endl;
    std::cout << "  Development Mode: " << (config.development_mode ? "yes" : "no") << std::endl;
    std::cout << "  Radio Enabled: " << (config.radio_enabled ? "yes" : "no") << std::endl;
    std::cout << "  TV Enabled: " << (config.tv_enabled ? "yes" : "no") << std::endl;
    std::cout << std::endl;
    
    // Create and initialize server
    server_instance = std::make_unique<media::Server>();
    
    auto result = server_instance->initialize(config);
    if (result.is_error()) {
        std::cerr << "Failed to initialize server: " << result.error_message() << std::endl;
        return 1;
    }
    
    std::cout << "Server initialized successfully" << std::endl;
    std::cout << "Starting HTTP server on " << config.bind_address << ":" << config.port << std::endl;
    std::cout << std::endl;
    
    // Print available endpoints
    std::cout << "Endpoints:" << std::endl;
    std::cout << "  Health:      GET  /health" << std::endl;
    std::cout << "  Metrics:     GET  /metrics" << std::endl;
    std::cout << std::endl;
    std::cout << "  Jobs:" << std::endl;
    std::cout << "    POST /api/jobs       - Submit job" << std::endl;
    std::cout << "    GET  /api/jobs       - List jobs" << std::endl;
    std::cout << "    GET  /api/jobs/:id   - Get job status" << std::endl;
    std::cout << "    DELETE /api/jobs/:id - Cancel job" << std::endl;
    std::cout << std::endl;
    std::cout << "  Radio:" << std::endl;
    std::cout << "    POST /api/radio/channels           - Create channel" << std::endl;
    std::cout << "    GET  /api/radio/channels           - List channels" << std::endl;
    std::cout << "    GET  /api/radio/channels/:id       - Get channel" << std::endl;
    std::cout << "    POST /api/radio/channels/:id/start - Start streaming" << std::endl;
    std::cout << "    POST /api/radio/channels/:id/stop  - Stop streaming" << std::endl;
    std::cout << "    GET  /api/radio/channels/:id/now   - Now playing" << std::endl;
    std::cout << std::endl;
    std::cout << "  TV:" << std::endl;
    std::cout << "    POST /api/tv/channels              - Create channel" << std::endl;
    std::cout << "    GET  /api/tv/channels              - List channels" << std::endl;
    std::cout << "    GET  /api/tv/channels/:id          - Get channel" << std::endl;
    std::cout << "    POST /api/tv/channels/:id/start    - Start streaming" << std::endl;
    std::cout << "    POST /api/tv/channels/:id/stop     - Stop streaming" << std::endl;
    std::cout << "    GET  /api/tv/channels/:id/schedule - Get EPG" << std::endl;
    std::cout << "    GET  /api/tv/epg                   - Full EPG (XMLTV)" << std::endl;
    std::cout << std::endl;
    std::cout << "  Plugins:" << std::endl;
    std::cout << "    GET  /api/plugins              - List plugins" << std::endl;
    std::cout << "    POST /api/plugins/:id/reload   - Reload plugin (dev)" << std::endl;
    std::cout << std::endl;
    
    if (daemon_mode) {
        std::cout << "Running in daemon mode..." << std::endl;
    } else {
        std::cout << "Press Ctrl+C to stop" << std::endl;
    }
    std::cout << std::endl;
    
    // Run server (blocking)
    server_instance->run();
    
    std::cout << "Media Daemon stopped" << std::endl;
    return 0;
}
