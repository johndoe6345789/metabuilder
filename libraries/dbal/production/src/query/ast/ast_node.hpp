#pragma once
/**
 * @file ast_node.hpp
 * @brief AST node type and structure
 */

#include <string>
#include <vector>
#include <memory>

namespace dbal::query {

enum class NodeType {
    Select,
    Insert,
    Update,
    Delete,
    Where,
    Join,
    OrderBy,
    Limit
};

struct ASTNode {
    NodeType type;
    std::string value;
    std::vector<std::shared_ptr<ASTNode>> children;
    
    ASTNode(NodeType t, const std::string& v = "") : type(t), value(v) {}
};

} // namespace dbal::query
