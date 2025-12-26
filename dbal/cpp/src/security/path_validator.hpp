#pragma once
/**
 * @file path_validator.hpp
 * @brief Secure path validation to prevent directory traversal
 * @details Header-only path security
 */

#include <string>
#include <algorithm>
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
    
    // Layer 1: Reject null bytes
    if (user_path.find('\0') != std::string::npos) {
        throw std::runtime_error("Path contains null byte");
    }
    
    // Layer 2: Reject obvious traversal patterns
    if (user_path.find("..") != std::string::npos) {
        throw std::runtime_error("Path contains traversal sequence");
    }
    
    // Layer 3: Reject absolute paths from user
    if (!user_path.empty() && (user_path[0] == '/' || user_path[0] == '\\')) {
        throw std::runtime_error("Absolute paths not allowed");
    }
    
    // Layer 4: Reject encoded characters that could hide traversal
    if (user_path.find('%') != std::string::npos) {
        throw std::runtime_error("Encoded characters not allowed");
    }
    
    // Layer 5: Normalize and resolve
    fs::path base = fs::canonical(base_path);
    fs::path combined = base / user_path;
    fs::path resolved = fs::weakly_canonical(combined);
    
    // Layer 6: Verify resolved path is within base (symlink protection)
    std::string base_str = base.string();
    std::string resolved_str = resolved.string();
    
    // Ensure base ends with separator for prefix check
    if (!base_str.empty() && base_str.back() != fs::path::preferred_separator) {
        base_str += fs::path::preferred_separator;
    }
    
    // Check prefix (resolved must start with base)
    if (resolved_str.compare(0, base_str.size(), base_str) != 0 &&
        resolved_str != base.string()) {
        throw std::runtime_error("Path escapes allowed directory");
    }
    
    return resolved_str;
}

/**
 * Check if a filename is safe (no path separators, no special names)
 * @param filename Filename to validate
 * @return true if safe
 */
inline bool is_safe_filename(const std::string& filename) {
    // Reject empty
    if (filename.empty()) return false;
    
    // Reject path separators
    if (filename.find('/') != std::string::npos) return false;
    if (filename.find('\\') != std::string::npos) return false;
    
    // Reject special names
    if (filename == "." || filename == "..") return false;
    
    // Reject null bytes
    if (filename.find('\0') != std::string::npos) return false;
    
    // Reject control characters
    for (char c : filename) {
        if (static_cast<unsigned char>(c) < 32) return false;
    }
    
    return true;
}

} // namespace dbal::security
