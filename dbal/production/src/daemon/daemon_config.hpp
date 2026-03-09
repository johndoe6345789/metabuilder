#pragma once

#include <string>
#include "dbal/core/client.hpp"

namespace dbal::daemon {

/**
 * Configuration for the DBAL daemon
 * Handles loading from environment variables and command line arguments
 */
struct DaemonConfig {
    std::string config_file = "config.yaml";
    std::string bind_address = "127.0.0.1";
    int port = 8080;
    bool development_mode = false;
    bool daemon_mode = false;

    /**
     * Load configuration from environment variables
     */
    static DaemonConfig fromEnvironment();

    /**
     * Parse command line arguments
     * Returns false if help was requested or parsing failed
     */
    bool parseCommandLine(int argc, char* argv[]);

    /**
     * Print help message
     */
    static void printHelp(const char* program_name);

    /**
     * Create ClientConfig from daemon configuration and environment
     */
    dbal::ClientConfig createClientConfig() const;
};

} // namespace dbal::daemon
