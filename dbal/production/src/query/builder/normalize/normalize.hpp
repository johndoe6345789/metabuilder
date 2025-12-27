#pragma once
/**
 * @file query_normalize.hpp wrapper
 * @brief QueryNormalizer class
 */

#include "query_normalize.hpp"

namespace dbal::query {

/**
 * Query normalizer class
 * Thin wrapper around normalize functions
 */
class QueryNormalizer {
public:
    static std::string normalize(const std::string& query) {
        return query_normalize(query);
    }
};

} // namespace dbal::query
