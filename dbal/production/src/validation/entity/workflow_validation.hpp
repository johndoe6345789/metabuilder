/**
 * @file workflow_validation.hpp
 * @brief Validation functions for Workflow entity
 */
#ifndef DBAL_WORKFLOW_VALIDATION_HPP
#define DBAL_WORKFLOW_VALIDATION_HPP

#include <string>
#include <array>
#include <algorithm>

namespace dbal {
namespace validation {

/**
 * Validate workflow name (1-255 characters)
 */
inline bool isValidWorkflowName(const std::string& name) {
    return !name.empty() && name.length() <= 255;
}

/**
 * Validate workflow trigger type
 */
inline bool isValidWorkflowTrigger(const std::string& trigger) {
    static const std::array<std::string, 4> allowed = {"manual", "schedule", "event", "webhook"};
    return std::find(allowed.begin(), allowed.end(), trigger) != allowed.end();
}

} // namespace validation
} // namespace dbal

#endif
