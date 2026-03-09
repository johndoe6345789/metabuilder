#ifndef DBAL_CORE_CONNECTION_VALIDATOR_HPP
#define DBAL_CORE_CONNECTION_VALIDATOR_HPP

#include <string>
#include <vector>

namespace dbal {
namespace core {

/**
 * Validation result for database connection strings.
 */
struct ValidationResult {
    bool is_valid;
    std::string error_message;
    std::string adapter_type;
    std::string normalized_url;

    ValidationResult() : is_valid(false) {}

    static ValidationResult success(const std::string& type, const std::string& url) {
        ValidationResult result;
        result.is_valid = true;
        result.adapter_type = type;
        result.normalized_url = url;
        return result;
    }

    static ValidationResult failure(const std::string& message) {
        ValidationResult result;
        result.is_valid = false;
        result.error_message = message;
        return result;
    }
};

/**
 * Validator for database connection strings across all supported backends.
 *
 * Validates URL format, protocol, and connection parameters for:
 * - SQLite: sqlite://path/to/db.sqlite or :memory:
 * - PostgreSQL: postgresql://user:pass@host:port/dbname
 * - MySQL: mysql://user:pass@host:port/dbname
 * - MongoDB: mongodb://user:pass@host:port/dbname
 * - Redis: redis://host:port/db
 * - And 8 more backends...
 */
class ConnectionValidator {
public:
    /**
     * Validate a database connection URL.
     *
     * @param database_url Connection string to validate
     * @return ValidationResult with status and error details
     */
    static ValidationResult validate(const std::string& database_url);

    /**
     * Validate SQLite connection string.
     *
     * Accepts:
     * - sqlite:///absolute/path/to/db.sqlite
     * - sqlite://relative/path/to/db.sqlite
     * - sqlite://:memory: (in-memory database)
     *
     * @param url SQLite connection URL
     * @return ValidationResult
     */
    static ValidationResult validateSQLite(const std::string& url);

    /**
     * Validate PostgreSQL connection string.
     *
     * Format: postgresql://[user[:password]@][host][:port][/dbname][?params]
     *
     * @param url PostgreSQL connection URL
     * @return ValidationResult
     */
    static ValidationResult validatePostgreSQL(const std::string& url);

    /**
     * Validate MySQL connection string.
     *
     * Format: mysql://[user[:password]@][host][:port][/dbname][?params]
     *
     * @param url MySQL connection URL
     * @return ValidationResult
     */
    static ValidationResult validateMySQL(const std::string& url);

    /**
     * Check if URL format is generally valid (has protocol://).
     *
     * @param url Connection URL
     * @return true if format is valid
     */
    static bool hasValidFormat(const std::string& url);

    /**
     * Extract protocol from URL.
     *
     * @param url Connection URL
     * @return Protocol string (e.g., "sqlite", "postgres")
     */
    static std::string extractProtocol(const std::string& url);

private:
    static bool isValidPath(const std::string& path);
    static bool isValidHostPort(const std::string& host, int port);
};

} // namespace core
} // namespace dbal

#endif // DBAL_CORE_CONNECTION_VALIDATOR_HPP
