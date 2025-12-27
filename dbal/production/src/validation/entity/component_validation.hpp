#ifndef DBAL_COMPONENT_VALIDATION_HPP
#define DBAL_COMPONENT_VALIDATION_HPP

#include <string>

namespace dbal {
namespace validation {

inline bool isValidComponentType(const std::string& component_type) {
    return !component_type.empty() && component_type.length() <= 100;
}

inline bool isValidComponentOrder(int value) {
    return value >= 0;
}

} // namespace validation
} // namespace dbal

#endif
