#include <string>
#include <vector>
#include <memory>

namespace dbal {
namespace query {

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

class ASTNode {
public:
    NodeType type;
    std::string value;
    std::vector<std::shared_ptr<ASTNode>> children;
    
    ASTNode(NodeType t, const std::string& v = "") : type(t), value(v) {}
    
    void addChild(std::shared_ptr<ASTNode> child) {
        children.push_back(child);
    }
};

class AST {
public:
    std::shared_ptr<ASTNode> root;
    
    AST() : root(nullptr) {}
    explicit AST(std::shared_ptr<ASTNode> r) : root(r) {}
    
    std::string toString() const {
        if (!root) return "";
        return nodeToString(root);
    }
    
private:
    std::string nodeToString(const std::shared_ptr<ASTNode>& node) const {
        if (!node) return "";
        
        std::string result = node->value;
        for (const auto& child : node->children) {
            result += " " + nodeToString(child);
        }
        return result;
    }
};

}
}
