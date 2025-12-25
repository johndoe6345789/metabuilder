#include <iostream>
#include <string>
#include <csignal>
#include <thread>
#include <chrono>
#include <memory>

// Cross-platform signal handling
#ifdef _WIN32
    #include <windows.h>
    // Windows doesn't have SIGTERM, use SIGBREAK
    #ifndef SIGTERM
    #define SIGTERM SIGBREAK
    #endif
#endif

// Include server
namespace dbal { namespace daemon { class Server; } }
#include "../daemon/server.cpp"

namespace {
    std::unique_ptr<dbal::daemon::Server> server_instance;
    
    void signalHandler(int signal) {
        if (signal == SIGINT || signal == SIGTERM) {
            std::cout << "\nShutting down DBAL daemon..." << std::endl;
            if (server_instance) {
                server_instance->stop();
            }
        }
    }
}

int main(int argc, char* argv[]) {
    std::cout << "DBAL Daemon v1.0.0" << std::endl;
    std::cout << "Copyright (c) 2024 MetaBuilder" << std::endl;
    std::cout << std::endl;
    
    // Register signal handlers
    std::signal(SIGINT, signalHandler);
    std::signal(SIGTERM, signalHandler);
    
    std::string config_file = "config.yaml";
    std::string bind_address = "127.0.0.1";
    int port = 8080;
    bool development_mode = false;
    bool daemon_mode = false;  // Default to interactive mode
    
    // Parse command line arguments
    for (int i = 1; i < argc; i++) {
        std::string arg = argv[i];
        
        if (arg == "--config" && i + 1 < argc) {
            config_file = argv[++i];
        } else if (arg == "--bind" && i + 1 < argc) {
            bind_address = argv[++i];
        } else if (arg == "--port" && i + 1 < argc) {
            port = std::stoi(argv[++i]);
        } else if (arg == "--mode" && i + 1 < argc) {
            std::string mode = argv[++i];
            development_mode = (mode == "development" || mode == "dev");
        } else if (arg == "--daemon" || arg == "-d") {
            daemon_mode = true;
        } else if (arg == "--help" || arg == "-h") {
            std::cout << "Usage: " << argv[0] << " [options]" << std::endl;
            std::cout << "Options:" << std::endl;
            std::cout << "  --config <file>    Configuration file (default: config.yaml)" << std::endl;
            std::cout << "  --bind <address>   Bind address (default: 127.0.0.1)" << std::endl;
            std::cout << "  --port <port>      Port number (default: 8080)" << std::endl;
            std::cout << "  --mode <mode>      Run mode: production, development (default: production)" << std::endl;
            std::cout << "  --daemon, -d       Run in daemon mode (default: interactive)" << std::endl;
            std::cout << "  --help, -h         Show this help message" << std::endl;
            std::cout << std::endl;
            std::cout << "Interactive mode (default):" << std::endl;
            std::cout << "  Shows a command prompt with available commands:" << std::endl;
            std::cout << "    status - Show server status" << std::endl;
            std::cout << "    help   - Show available commands" << std::endl;
            std::cout << "    stop   - Stop the server and exit" << std::endl;
            std::cout << std::endl;
            std::cout << "Nginx reverse proxy example:" << std::endl;
            std::cout << "  location /api/ {" << std::endl;
            std::cout << "    proxy_pass http://127.0.0.1:8080/;" << std::endl;
            std::cout << "    proxy_set_header X-Real-IP $remote_addr;" << std::endl;
            std::cout << "    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;" << std::endl;
            std::cout << "    proxy_set_header X-Forwarded-Proto $scheme;" << std::endl;
            std::cout << "    proxy_set_header Host $host;" << std::endl;
            std::cout << "  }" << std::endl;
            return 0;
        }
    }
    
    std::cout << "Configuration: " << config_file << std::endl;
    std::cout << "Mode: " << (development_mode ? "development" : "production") << std::endl;
    std::cout << std::endl;
    
    // Create and start HTTP server
    server_instance = std::make_unique<dbal::daemon::Server>(bind_address, port);
    
    if (!server_instance->start()) {
        std::cerr << "Failed to start server" << std::endl;
        return 1;
    }
    
    std::cout << std::endl;
    std::cout << "API endpoints:" << std::endl;
    std::cout << "  GET  /health      - Health check" << std::endl;
    std::cout << "  GET  /version     - Version information" << std::endl;
    std::cout << "  GET  /status      - Server status" << std::endl;
    std::cout << std::endl;
    
    if (daemon_mode) {
        // Daemon mode: run in background until signal
        std::cout << "Daemon mode: Running in background. Press Ctrl+C to stop." << std::endl;
        
        while (server_instance->isRunning()) {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
    } else {
        // Interactive mode: show command prompt
        std::cout << "Interactive mode: Type 'help' for available commands, 'stop' to exit." << std::endl;
        std::cout << std::endl;
        
        std::string command;
        while (server_instance->isRunning()) {
            std::cout << "dbal> ";
            std::cout.flush();
            
            if (!std::getline(std::cin, command)) {
                // EOF or error, exit gracefully
                break;
            }
            
            // Trim whitespace
            size_t start = command.find_first_not_of(" \t\r\n");
            size_t end = command.find_last_not_of(" \t\r\n");
            if (start == std::string::npos) {
                continue; // Empty line
            }
            command = command.substr(start, end - start + 1);
            
            if (command.empty()) {
                continue;
            }
            
            if (command == "help" || command == "?") {
                std::cout << "Available commands:" << std::endl;
                std::cout << "  status - Show server status and statistics" << std::endl;
                std::cout << "  help   - Show this help message" << std::endl;
                std::cout << "  stop   - Stop the server and exit" << std::endl;
                std::cout << "  exit   - Alias for stop" << std::endl;
                std::cout << "  quit   - Alias for stop" << std::endl;
            } else if (command == "status") {
                std::cout << "Server status:" << std::endl;
                std::cout << "  Address: " << bind_address << ":" << port << std::endl;
                std::cout << "  Mode: " << (development_mode ? "development" : "production") << std::endl;
                std::cout << "  Status: " << (server_instance->isRunning() ? "running" : "stopped") << std::endl;
            } else if (command == "stop" || command == "exit" || command == "quit") {
                std::cout << "Stopping server..." << std::endl;
                server_instance->stop();
                break;
            } else {
                std::cout << "Unknown command: " << command << std::endl;
                std::cout << "Type 'help' for available commands." << std::endl;
            }
        }
    }
    
    std::cout << "Daemon stopped." << std::endl;
    return 0;
}
