#pragma once
/**
 * @file builder.hpp
 * @brief QueryBuilder class (wrapper)
 */

#include "builder_state.hpp"
#include "builder_select.hpp"
#include "builder_from.hpp"
#include "builder_where.hpp"
#include "builder_order_by.hpp"
#include "builder_limit.hpp"
#include "builder_build.hpp"

namespace dbal::query {

/**
 * Query builder class
 * Thin wrapper around builder functions
 */
class QueryBuilder {
public:
    QueryBuilder& select(const std::vector<std::string>& columns) {
        builder_select(state_, columns);
        return *this;
    }
    
    QueryBuilder& from(const std::string& table) {
        builder_from(state_, table);
        return *this;
    }
    
    QueryBuilder& where(const std::string& condition) {
        builder_where(state_, condition);
        return *this;
    }
    
    QueryBuilder& orderBy(const std::string& column, const std::string& direction = "ASC") {
        builder_order_by(state_, column, direction);
        return *this;
    }
    
    QueryBuilder& limit(int lim) {
        builder_limit(state_, lim);
        return *this;
    }
    
    std::string build() const {
        return builder_build(state_);
    }
    
private:
    BuilderState state_;
};

} // namespace dbal::query
