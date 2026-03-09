#include "daemon_init.hpp"
#include <cstdlib>
#include <csignal>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/stdout_color_sinks.h>

// Cross-platform signal handling
#ifdef _WIN32
    #include <windows.h>
    // Windows doesn't have SIGTERM, use SIGBREAK
    #ifndef SIGTERM
    #define SIGTERM SIGBREAK
    #endif
#endif

namespace dbal::daemon {

namespace {
    std::unique_ptr<Server>* g_server_instance = nullptr;

    void signalHandler(int signal) {
        if (signal == SIGINT || signal == SIGTERM) {
            spdlog::info("\nShutting down DBAL daemon...");
            if (g_server_instance && *g_server_instance) {
                (*g_server_instance)->stop();
            }
        }
    }
}

void DaemonInit::setupLogging() {
    auto console = spdlog::stdout_color_mt("dbal");
    const char* log_level_env = std::getenv("DBAL_LOG_LEVEL");
    std::string log_level = log_level_env ? log_level_env : "info";

    if (log_level == "trace") {
        spdlog::set_level(spdlog::level::trace);
    } else if (log_level == "debug") {
        spdlog::set_level(spdlog::level::debug);
    } else if (log_level == "warn") {
        spdlog::set_level(spdlog::level::warn);
    } else if (log_level == "error") {
        spdlog::set_level(spdlog::level::err);
    } else {
        spdlog::set_level(spdlog::level::info);
    }

    spdlog::set_default_logger(console);
}

void DaemonInit::printBanner() {
    spdlog::info("╔════════════════════════════════════════════╗");
    spdlog::info("║         DBAL Daemon v1.2.1                 ║");
    spdlog::info("║   Database Abstraction Layer Server       ║");
    spdlog::info("║   Copyright (c) 2024 MetaBuilder           ║");
    spdlog::info("╚════════════════════════════════════════════╝");
}

void DaemonInit::setupSignalHandlers(std::unique_ptr<Server>& server) {
    g_server_instance = &server;
    std::signal(SIGINT, signalHandler);
    std::signal(SIGTERM, signalHandler);
}

void DaemonInit::logConfiguration(const DaemonConfig& config, const dbal::ClientConfig& client_config) {
    spdlog::info("Configuration file: {}", config.config_file);
    spdlog::info("Run mode: {}", config.development_mode ? "development" : "production");
    spdlog::info("");
    spdlog::info("Client configuration:");
    spdlog::info("  adapter: '{}'", client_config.adapter);
    spdlog::info("  database_url: '{}'", client_config.database_url);
    spdlog::info("  mode: '{}'", client_config.mode);
    spdlog::info("  endpoint: '{}'", client_config.endpoint);
}

void DaemonInit::logApiEndpoints() {
    spdlog::info("");
    spdlog::info("API endpoints:");
    spdlog::info("  GET  /health      - Health check");
    spdlog::info("  GET  /version     - Version information");
    spdlog::info("  GET  /status      - Server status");
    spdlog::info("");
}

} // namespace dbal::daemon
