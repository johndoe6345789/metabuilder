#include "dbal/core/client_config.hpp"
#include "dbal/core/connection_validator.hpp"
#include <stdexcept>
#include <algorithm>
#include <cctype>

namespace dbal {
namespace core {

ClientConfigManager::ClientConfigManager(
    const std::string& mode,
    const std::string& adapter,
    const std::string& endpoint,
    const std::string& database_url,
    bool sandbox_enabled
)
    : mode_(mode),
      adapter_(adapter),
      endpoint_(endpoint),
      database_url_(database_url),
      sandbox_enabled_(sandbox_enabled)
{
    validate();
}

void ClientConfigManager::setParameter(const std::string& key, const std::string& value) {
    parameters_[key] = value;
}

std::string ClientConfigManager::getParameter(const std::string& key) const {
    auto it = parameters_.find(key);
    if (it != parameters_.end()) {
        return it->second;
    }
    return "";
}

bool ClientConfigManager::hasParameter(const std::string& key) const {
    return parameters_.find(key) != parameters_.end();
}

void ClientConfigManager::validate() const {
    validateMode();
    validateAdapter();
    validateDatabaseUrl();
}

void ClientConfigManager::validateMode() const {
    if (mode_.empty()) {
        return; // Mode is optional
    }

    std::string lower_mode = mode_;
    std::transform(lower_mode.begin(), lower_mode.end(), lower_mode.begin(),
                   [](unsigned char c) { return std::tolower(c); });

    if (lower_mode != "development" && lower_mode != "dev" &&
        lower_mode != "production" && lower_mode != "prod" &&
        lower_mode != "test") {
        throw std::invalid_argument(
            "Invalid mode: " + mode_ + ". Valid modes: development, production, test"
        );
    }
}

void ClientConfigManager::validateAdapter() const {
    if (adapter_.empty()) {
        throw std::invalid_argument("Adapter type must be specified");
    }

    // Adapter type will be validated by AdapterFactory
}

void ClientConfigManager::validateDatabaseUrl() const {
    if (database_url_.empty()) {
        throw std::invalid_argument("Database URL must be specified");
    }

    // Validate URL format using ConnectionValidator
    ValidationResult result = ConnectionValidator::validate(database_url_);
    if (!result.is_valid) {
        throw std::invalid_argument("Invalid database URL: " + result.error_message);
    }

    // Verify adapter type matches URL protocol
    std::string url_adapter = ConnectionValidator::extractProtocol(database_url_);
    if (!url_adapter.empty() && adapter_ != url_adapter) {
        // Allow some flexibility for protocol aliases
        if (!((adapter_ == "postgres" || adapter_ == "postgresql") &&
              (url_adapter == "postgres" || url_adapter == "postgresql"))) {
            throw std::invalid_argument(
                "Adapter type '" + adapter_ + "' does not match URL protocol '" + url_adapter + "'"
            );
        }
    }
}

} // namespace core
} // namespace dbal
