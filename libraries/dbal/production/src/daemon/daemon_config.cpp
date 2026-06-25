#include "daemon_config.hpp"
#include <cstdlib>
#include <string>
#include <iostream>

namespace dbal::daemon {

DaemonConfig DaemonConfig::fromEnvironment() {
    DaemonConfig config;

    // Load defaults from environment variables
    const char* env_bind = std::getenv("DBAL_BIND_ADDRESS");
    if (env_bind) config.bind_address = env_bind;

    const char* env_port = std::getenv("DBAL_PORT");
    if (env_port) config.port = std::stoi(env_port);

    const char* env_mode = std::getenv("DBAL_MODE");
    if (env_mode) {
        std::string mode_str = env_mode;
        config.development_mode = (mode_str == "development" || mode_str == "dev");
    }

    const char* env_config = std::getenv("DBAL_CONFIG");
    if (env_config) config.config_file = env_config;

    const char* env_daemon = std::getenv("DBAL_DAEMON");
    if (env_daemon) {
        std::string daemon_str = env_daemon;
        config.daemon_mode = (daemon_str == "true" || daemon_str == "1" || daemon_str == "yes");
    }

    return config;
}

bool DaemonConfig::parseCommandLine(int argc, char* argv[]) {
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
            printHelp(argv[0]);
            return false;
        }
    }
    return true;
}

void DaemonConfig::printHelp(const char* program_name) {
    std::cout << "Usage: " << program_name << " [options]" << std::endl;
    std::cout << "Options:" << std::endl;
    std::cout << "  --config <file>    Configuration file (default: config.yaml)" << std::endl;
    std::cout << "  --bind <address>   Bind address (default: 127.0.0.1)" << std::endl;
    std::cout << "  --port <port>      Port number (default: 8080)" << std::endl;
    std::cout << "  --mode <mode>      Run mode: production, development (default: production)" << std::endl;
    std::cout << "  --daemon, -d       Run in daemon mode (default: interactive)" << std::endl;
    std::cout << "  --help, -h         Show this help message" << std::endl;
    std::cout << std::endl;
    std::cout << "Environment variables (overridden by CLI args):" << std::endl;
    std::cout << "  DBAL_BIND_ADDRESS  Bind address" << std::endl;
    std::cout << "  DBAL_PORT          Port number" << std::endl;
    std::cout << "  DBAL_MODE          Run mode (production/development)" << std::endl;
    std::cout << "  DBAL_CONFIG        Configuration file path" << std::endl;
    std::cout << "  DBAL_DAEMON        Run in daemon mode (true/false)" << std::endl;
    std::cout << "  DBAL_LOG_LEVEL     Log level (trace/debug/info/warn/error/critical)" << std::endl;
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
}

dbal::ClientConfig DaemonConfig::createClientConfig() const {
    dbal::ClientConfig client_config;
    client_config.mode = development_mode ? "development" : "production";

    const char* adapter_env = std::getenv("DBAL_ADAPTER");
    client_config.adapter = adapter_env ? adapter_env : "sqlite";

    const char* database_env = std::getenv("DBAL_DATABASE_URL");
    if (!database_env) {
        database_env = std::getenv("DATABASE_URL");
    }
    client_config.database_url = database_env ? database_env : ":memory:";
    client_config.sandbox_enabled = true;

    const char* endpoint_env = std::getenv("DBAL_ENDPOINT");
    if (endpoint_env) {
        client_config.endpoint = endpoint_env;
    }

    return client_config;
}

} // namespace dbal::daemon
