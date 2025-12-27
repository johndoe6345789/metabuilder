#pragma once
/**
 * @file query_normalize.hpp
 * @brief Query string normalization
 */

#include <string>
#include <algorithm>
#include <cctype>

namespace dbal::query {

/**
 * Remove extra whitespace from string
 * @param str Input string
 * @return String with single spaces
 */
inline std::string query_remove_extra_whitespace(const std::string& str) {
    std::string result;
    bool lastWasSpace = false;
    
    for (char c : str) {
        if (std::isspace(static_cast<unsigned char>(c))) {
            if (!lastWasSpace) {
                result += ' ';
                lastWasSpace = true;
            }
        } else {
            result += c;
            lastWasSpace = false;
        }
    }
    
    size_t start = result.find_first_not_of(' ');
    size_t end = result.find_last_not_of(' ');
    
    if (start != std::string::npos && end != std::string::npos) {
        return result.substr(start, end - start + 1);
    }
    
    return result;
}

/**
 * Normalize a query string (uppercase, trim whitespace)
 * @param query Input query
 * @return Normalized query
 */
inline std::string query_normalize(const std::string& query) {
    std::string normalized = query;
    
    std::transform(normalized.begin(), normalized.end(), normalized.begin(),
        [](unsigned char c) { return std::toupper(c); });
    
    return query_remove_extra_whitespace(normalized);
}

} // namespace dbal::query
