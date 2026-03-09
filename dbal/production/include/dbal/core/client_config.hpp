#ifndef DBAL_CORE_CLIENT_CONFIG_HPP
#define DBAL_CORE_CLIENT_CONFIG_HPP

#include <string>
#include <map>

namespace dbal {
namespace core {

/**
 * Configuration parser and manager for DBAL client.
 *
 * Parses and validates client configuration including:
 * - Mode (development/production)
 * - Adapter type (sqlite, postgres, mysql, etc.)
 * - Endpoint (for HTTP-based adapters)
 * - Database URL (connection string)
 * - Sandbox settings
 * - Additional connection parameters
 */
class ClientConfigManager {
public:
    /**
     * Parse and validate client configuration.
     *
     * @param mode Operation mode (dev/prod)
     * @param adapter Adapter type
     * @param endpoint Optional endpoint URL
     * @param database_url Database connection string
     * @param sandbox_enabled Whether sandbox mode is enabled
     * @throws std::invalid_argument if configuration is invalid
     */
    ClientConfigManager(
        const std::string& mode,
        const std::string& adapter,
        const std::string& endpoint,
        const std::string& database_url,
        bool sandbox_enabled
    );

    /**
     * Get operation mode.
     */
    const std::string& getMode() const { return mode_; }

    /**
     * Get adapter type.
     */
    const std::string& getAdapter() const { return adapter_; }

    /**
     * Get endpoint URL (if applicable).
     */
    const std::string& getEndpoint() const { return endpoint_; }

    /**
     * Get database connection URL.
     */
    const std::string& getDatabaseUrl() const { return database_url_; }

    /**
     * Check if sandbox mode is enabled.
     */
    bool isSandboxEnabled() const { return sandbox_enabled_; }

    /**
     * Set a connection parameter.
     *
     * @param key Parameter name
     * @param value Parameter value
     */
    void setParameter(const std::string& key, const std::string& value);

    /**
     * Get a connection parameter.
     *
     * @param key Parameter name
     * @return Parameter value (empty string if not found)
     */
    std::string getParameter(const std::string& key) const;

    /**
     * Check if a parameter exists.
     *
     * @param key Parameter name
     * @return true if parameter exists
     */
    bool hasParameter(const std::string& key) const;

    /**
     * Get all connection parameters.
     */
    const std::map<std::string, std::string>& getParameters() const { return parameters_; }

    /**
     * Validate the configuration.
     *
     * @throws std::invalid_argument if configuration is invalid
     */
    void validate() const;

private:
    std::string mode_;
    std::string adapter_;
    std::string endpoint_;
    std::string database_url_;
    bool sandbox_enabled_;
    std::map<std::string, std::string> parameters_;

    void validateMode() const;
    void validateAdapter() const;
    void validateDatabaseUrl() const;
};

} // namespace core
} // namespace dbal

#endif // DBAL_CORE_CLIENT_CONFIG_HPP
