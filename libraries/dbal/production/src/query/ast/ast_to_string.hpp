#pragma once
/**
 * @file ast_to_string.hpp
 * @brief Convert AST to string
 */

#include "ast_node.hpp"

namespace dbal::query {

/**
 * Convert AST node to string representation
 * @param node Node to convert
 * @return String representation
 */
inline std::string ast_node_to_string(const std::shared_ptr<ASTNode>& node) {
    if (!node) return "";
    
    std::string result = node->value;
    for (const auto& child : node->children) {
        result += " " + ast_node_to_string(child);
    }
    return result;
}

} // namespace dbal::query
