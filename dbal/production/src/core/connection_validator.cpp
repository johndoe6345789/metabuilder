#include "dbal/core/connection_validator.hpp"
#include <algorithm>
#include <cctype>
#include <regex>

namespace dbal {
namespace core {

ValidationResult ConnectionValidator::validate(const std::string& database_url) {
    if (database_url.empty()) {
        return ValidationResult::failure("Database URL cannot be empty");
    }

    if (!hasValidFormat(database_url)) {
        return ValidationResult::failure("Invalid URL format. Expected: protocol://...");
    }

    std::string protocol = extractProtocol(database_url);

    if (protocol == "sqlite") {
        return validateSQLite(database_url);
    } else if (protocol == "postgresql" || protocol == "postgres") {
        return validatePostgreSQL(database_url);
    } else if (protocol == "mysql") {
        return validateMySQL(database_url);
    }
    // Add more protocol handlers here

    return ValidationResult::failure("Unsupported database protocol: " + protocol);
}

ValidationResult ConnectionValidator::validateSQLite(const std::string& url) {
    // Extract path after sqlite://
    size_t pos = url.find("://");
    if (pos == std::string::npos) {
        return ValidationResult::failure("Invalid SQLite URL format");
    }

    std::string path = url.substr(pos + 3);

    // Special case: in-memory database
    if (path == ":memory:") {
        return ValidationResult::success("sqlite", url);
    }

    // Check if path is empty
    if (path.empty()) {
        return ValidationResult::failure("SQLite path cannot be empty");
    }

    // Basic path validation (allow relative and absolute paths)
    if (!isValidPath(path)) {
        return ValidationResult::failure("Invalid SQLite database path: " + path);
    }

    return ValidationResult::success("sqlite", url);
}

ValidationResult ConnectionValidator::validatePostgreSQL(const std::string& url) {
    // Basic PostgreSQL URL format validation
    // postgresql://[user[:password]@][host][:port][/dbname][?params]

    std::regex pg_regex(
        R"(^(postgresql|postgres)://([^:@]+(:([^@]+))?@)?([^:/]+)(:(\d+))?(/([^?]+))?(\?.*)?$)"
    );

    if (!std::regex_match(url, pg_regex)) {
        return ValidationResult::failure("Invalid PostgreSQL URL format");
    }

    // Normalize protocol to "postgres"
    std::string normalized = url;
    if (normalized.find("postgresql://") == 0) {
        normalized.replace(0, 13, "postgres://");
    }

    return ValidationResult::success("postgres", normalized);
}

ValidationResult ConnectionValidator::validateMySQL(const std::string& url) {
    // Basic MySQL URL format validation
    // mysql://[user[:password]@][host][:port][/dbname][?params]

    std::regex mysql_regex(
        R"(^mysql://([^:@]+(:([^@]+))?@)?([^:/]+)(:(\d+))?(/([^?]+))?(\?.*)?$)"
    );

    if (!std::regex_match(url, mysql_regex)) {
        return ValidationResult::failure("Invalid MySQL URL format");
    }

    return ValidationResult::success("mysql", url);
}

bool ConnectionValidator::hasValidFormat(const std::string& url) {
    return url.find("://") != std::string::npos;
}

std::string ConnectionValidator::extractProtocol(const std::string& url) {
    size_t pos = url.find("://");
    if (pos == std::string::npos) {
        return "";
    }

    std::string protocol = url.substr(0, pos);
    std::transform(protocol.begin(), protocol.end(), protocol.begin(),
                   [](unsigned char c) { return std::tolower(c); });

    return protocol;
}

bool ConnectionValidator::isValidPath(const std::string& path) {
    // Basic path validation - not empty and doesn't contain null characters
    if (path.empty()) {
        return false;
    }

    // Check for null characters
    if (path.find('\0') != std::string::npos) {
        return false;
    }

    // Allow both relative and absolute paths
    return true;
}

bool ConnectionValidator::isValidHostPort(const std::string& host, int port) {
    if (host.empty()) {
        return false;
    }

    if (port < 1 || port > 65535) {
        return false;
    }

    return true;
}

} // namespace core
} // namespace dbal
