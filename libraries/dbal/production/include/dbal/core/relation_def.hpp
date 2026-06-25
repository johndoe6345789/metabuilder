#ifndef DBAL_RELATION_DEF_HPP
#define DBAL_RELATION_DEF_HPP

#include <string>

namespace dbal {
namespace core {

/**
 * @brief Defines a relationship between entities for Prisma schema generation
 */
struct RelationDef {
    std::string name;           // Field name (e.g., "user", "posts")
    std::string type;           // Relation type: "belongs-to", "has-one", "has-many", "many-to-many", "polymorphic"
    std::string entity;         // Target entity name (e.g., "User", "Post")
    std::string foreignKey;     // Foreign key field name (e.g., "userId")
    bool nullable = false;      // Whether the relation is optional
    std::string onDelete;       // Delete action: "cascade", "set_null", "restrict", "no_action"
    std::string onUpdate;       // Update action: "cascade", "set_null", "restrict", "no_action"
};

} // namespace core
} // namespace dbal

#endif // DBAL_RELATION_DEF_HPP
