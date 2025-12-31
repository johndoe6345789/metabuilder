#pragma once
/**
 * @file builder_state.hpp
 * @brief Query builder state
 */

#include <string>
#include <vector>

namespace dbal::query {

/**
 * Query builder state
 */
struct BuilderState {
    std::string query_type;
    std::vector<std::string> columns;
    std::string table;
    std::vector<std::string> conditions;
    std::string order_by;
    int limit = 0;
};

} // namespace dbal::query
