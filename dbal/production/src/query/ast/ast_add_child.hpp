#pragma once
/**
 * @file ast_add_child.hpp
 * @brief Add child to AST node
 */

#include "ast_node.hpp"

namespace dbal::query {

/**
 * Add a child node to parent
 * @param parent Parent node
 * @param child Child node to add
 */
inline void ast_add_child(ASTNode& parent, std::shared_ptr<ASTNode> child) {
    parent.children.push_back(child);
}

} // namespace dbal::query
