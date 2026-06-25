#pragma once
/**
 * @file contains_sql_keyword.hpp
 * @brief SQL keyword detection
 */

#include <string>
#include <algorithm>
#include <cctype>

namespace dbal::security {

/**
 * Check if string matches a SQL keyword (case-insensitive)
 * @param value String to check
 * @return true if matches SQL keyword
 */
inline bool contains_sql_keyword(const std::string& value) {
    static const char* keywords[] = {
        "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER",
        "TRUNCATE", "GRANT", "REVOKE", "UNION", "JOIN", "WHERE", "FROM",
        "TABLE", "DATABASE", "INDEX", "VIEW", "PROCEDURE", "FUNCTION",
        "TRIGGER", "EXEC", "EXECUTE", "SCHEMA", nullptr
    };
    
    std::string upper = value;
    std::transform(upper.begin(), upper.end(), upper.begin(), 
        [](unsigned char c) { return std::toupper(c); });
    
    for (const char** kw = keywords; *kw != nullptr; ++kw) {
        if (upper == *kw) {
            return true;
        }
    }
    
    return false;
}

} // namespace dbal::security
