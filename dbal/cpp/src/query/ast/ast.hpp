#pragma once
/**
 * @file ast.hpp
 * @brief AST class (wrapper)
 */

#include "ast_node.hpp"
#include "ast_add_child.hpp"
#include "ast_to_string.hpp"

namespace dbal::query {

/**
 * AST wrapper class
 */
class AST {
public:
    std::shared_ptr<ASTNode> root;
    
    AST() : root(nullptr) {}
    explicit AST(std::shared_ptr<ASTNode> r) : root(r) {}
    
    std::string toString() const {
        return ast_node_to_string(root);
    }
};

} // namespace dbal::query
