#pragma once
/**
 * @file uuid.hpp
 * @brief UUID utilities (wrapper class)
 */

#include "uuid_generate.hpp"
#include "uuid_is_valid.hpp"

namespace dbal::util {

/**
 * UUID helper class
 * Thin wrapper around uuid functions
 */
class UUID {
public:
    static std::string generate() { return uuid_generate(); }
    static bool isValid(const std::string& uuid) { return uuid_is_valid(uuid); }
};

} // namespace dbal::util
