#pragma once
/**
 * @file capabilities_supports.hpp
 * @brief Check if adapter supports capability
 */

#include <string>
#include "capabilities_detect.hpp"

namespace dbal {

/**
 * Check if adapter supports a specific capability
 * @param adapter Adapter name
 * @param capability Capability to check
 * @return true if supported
 */
inline bool capabilities_supports(const std::string& adapter, const std::string& capability) {
    auto caps = capabilities_detect(adapter);
    for (const auto& cap : caps) {
        if (cap == capability) return true;
    }
    return false;
}

} // namespace dbal
