/**
 * @file client_init.cpp
 * @brief DBAL Client initialization and lifecycle management.
 *
 * This file contains:
 * - Constructor: Validates config and creates adapter
 * - Destructor: Cleanup resources
 * - close(): Explicit cleanup method
 */
#include "dbal/client.hpp"
#include "dbal/core/adapter_factory.hpp"
#include "dbal/core/connection_validator.hpp"
#include "dbal/core/client_config.hpp"
#include "dbal/core/operation_executor.hpp"
#include "dbal/core/metadata_cache.hpp"
#include <stdexcept>

namespace dbal {

Client::Client(const ClientConfig& config) : config_(config) {
    // Validate configuration using ClientConfigManager
    core::ClientConfigManager config_manager(
        config.mode,
        config.adapter,
        config.endpoint,
        config.database_url,
        config.sandbox_enabled
    );

    // Create adapter using factory
    adapter_ = core::AdapterFactory::createFromUrl(config.database_url);
}

Client::~Client() {
    close();
}

void Client::close() {
    // For in-memory implementation, optionally clear store.
}

} // namespace dbal
