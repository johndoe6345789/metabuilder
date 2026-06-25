#pragma once
/**
 * @file capabilities_detect.hpp
 * @brief Detect adapter capabilities
 */

#include <string>
#include <vector>

namespace dbal {

/**
 * Detect capabilities for a database adapter
 * @param adapter Adapter name (sqlite, prisma, etc.)
 * @return List of supported capabilities
 */
inline std::vector<std::string> capabilities_detect(const std::string& adapter) {
    std::vector<std::string> caps;
    
    if (adapter == "sqlite") {
        caps.push_back("crud");
        caps.push_back("transactions");
        caps.push_back("fulltext_search");
    } else if (adapter == "prisma") {
        caps.push_back("crud");
        caps.push_back("transactions");
        caps.push_back("relations");
        caps.push_back("migrations");
    }
    
    return caps;
}

} // namespace dbal
