#include <memory>
#include <spdlog/spdlog.h>
#include "server.hpp"
#include "daemon_init.hpp"
#include "daemon_config.hpp"

int main(int argc, char* argv[]) {
    using namespace dbal::daemon;

    // Initialize logging
    DaemonInit::setupLogging();
    DaemonInit::printBanner();

    // Load configuration from environment and command line
    DaemonConfig config = DaemonConfig::fromEnvironment();
    if (!config.parseCommandLine(argc, argv)) {
        return 0; // Help was printed or parsing failed
    }

    // Create client configuration
    dbal::ClientConfig client_config = config.createClientConfig();

    // Log configuration
    DaemonInit::logConfiguration(config, client_config);

    // Create and start HTTP server
    auto server_instance = std::make_unique<Server>(
        config.bind_address,
        config.port,
        client_config
    );

    // Setup signal handlers for graceful shutdown
    DaemonInit::setupSignalHandlers(server_instance);

    if (!server_instance->start()) {
        spdlog::error("Failed to start server");
        return 1;
    }

    // Log available endpoints
    DaemonInit::logApiEndpoints();

    // Run server (blocking call)
    if (config.daemon_mode) {
        spdlog::info("Daemon mode: Running event loop on main thread. Press Ctrl+C to stop.");
    } else {
        spdlog::info("Interactive mode: Running event loop. Press Ctrl+C to stop.");
        spdlog::warn("Note: Interactive commands temporarily disabled - use daemon mode or Ctrl+C to stop.");
    }

    server_instance->run(); // Blocking call - MUST be on main thread per Drogon requirements

    spdlog::info("Daemon stopped.");
    return 0;
}
