#pragma once

#include <memory>
#include "server.hpp"
#include "daemon_config.hpp"
#include "dbal/core/client.hpp"

namespace dbal::daemon {

/**
 * Daemon initialization utilities
 * Handles logging setup, signal handlers, and startup logging
 */
class DaemonInit {
public:
    /**
     * Setup logging based on DBAL_LOG_LEVEL environment variable
     */
    static void setupLogging();

    /**
     * Print ASCII art banner
     */
    static void printBanner();

    /**
     * Setup signal handlers for graceful shutdown
     */
    static void setupSignalHandlers(std::unique_ptr<Server>& server);

    /**
     * Log daemon configuration
     */
    static void logConfiguration(const DaemonConfig& config, const dbal::ClientConfig& client_config);

    /**
     * Log available API endpoints
     */
    static void logApiEndpoints();
};

} // namespace dbal::daemon
