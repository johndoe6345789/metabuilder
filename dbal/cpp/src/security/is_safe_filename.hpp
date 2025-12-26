#pragma once
/**
 * @file is_safe_filename.hpp
 * @brief Filename safety validation
 */

#include <string>

namespace dbal::security {

/**
 * Check if a filename is safe (no path separators, no special names)
 * @param filename Filename to validate
 * @return true if safe
 */
inline bool is_safe_filename(const std::string& filename) {
    if (filename.empty()) return false;
    
    if (filename.find('/') != std::string::npos) return false;
    if (filename.find('\\') != std::string::npos) return false;
    
    if (filename == "." || filename == "..") return false;
    
    if (filename.find('\0') != std::string::npos) return false;
    
    for (char c : filename) {
        if (static_cast<unsigned char>(c) < 32) return false;
    }
    
    return true;
}

} // namespace dbal::security
