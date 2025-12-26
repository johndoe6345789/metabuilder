#pragma once
/**
 * @file validate_path.hpp
 * @brief Secure path validation to prevent directory traversal
 */

#include <string>
#include <filesystem>
#include <stdexcept>

namespace dbal::security {

/**
 * Validate and resolve a path safely within a base directory
 * Prevents: ../, encoded traversal, symlink escapes, null bytes
 * 
 * @param base_path Allowed base directory (must be absolute)
 * @param user_path User-supplied relative path
 * @return Resolved safe absolute path
 * @throws std::runtime_error if path is invalid or escapes base
 */
inline std::string validate_path(
    const std::string& base_path,
    const std::string& user_path
) {
    namespace fs = std::filesystem;
    
    if (user_path.find('\0') != std::string::npos) {
        throw std::runtime_error("Path contains null byte");
    }
    
    if (user_path.find("..") != std::string::npos) {
        throw std::runtime_error("Path contains traversal sequence");
    }
    
    if (!user_path.empty() && (user_path[0] == '/' || user_path[0] == '\\')) {
        throw std::runtime_error("Absolute paths not allowed");
    }
    
    if (user_path.find('%') != std::string::npos) {
        throw std::runtime_error("Encoded characters not allowed");
    }
    
    fs::path base = fs::canonical(base_path);
    fs::path combined = base / user_path;
    fs::path resolved = fs::weakly_canonical(combined);
    
    std::string base_str = base.string();
    std::string resolved_str = resolved.string();
    
    if (!base_str.empty() && base_str.back() != fs::path::preferred_separator) {
        base_str += fs::path::preferred_separator;
    }
    
    if (resolved_str.compare(0, base_str.size(), base_str) != 0 &&
        resolved_str != base.string()) {
        throw std::runtime_error("Path escapes allowed directory");
    }
    
    return resolved_str;
}

} // namespace dbal::security
