#pragma once
/**
 * @file capabilities.hpp
 * @brief Capabilities detection (wrapper class)
 */

#include "capabilities_detect.hpp"
#include "capabilities_supports.hpp"

namespace dbal {

/**
 * Capabilities helper class
 * Thin wrapper around capabilities functions
 */
class Capabilities {
public:
    static std::vector<std::string> detect(const std::string& adapter) {
        return capabilities_detect(adapter);
    }
    
    static bool supports(const std::string& adapter, const std::string& capability) {
        return capabilities_supports(adapter, capability);
    }
};

} // namespace dbal
