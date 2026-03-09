#include "prisma_relation_generator.hpp"
#include <sstream>

namespace dbal {
namespace core {

std::string PrismaRelationGenerator::generateRelation(const RelationDef& relation) {
    std::ostringstream out;

    if (relation.type == "belongs-to") {
        // Relation field
        out << relation.name << " " << relation.entity;
        if (relation.nullable) {
            out << "?";
        }
        out << " @relation(fields: [" << relation.foreignKey << "], references: [id]";

        if (!relation.onDelete.empty() && relation.onDelete != "no_action") {
            out << ", onDelete: " << generateOnDelete(relation.onDelete);
        }
        if (!relation.onUpdate.empty() && relation.onUpdate != "no_action") {
            out << ", onUpdate: " << generateOnDelete(relation.onUpdate);
        }

        out << ")";
    }
    else if (relation.type == "has-one") {
        // Relation field
        out << relation.name << " " << relation.entity << "?";
    }
    else if (relation.type == "has-many") {
        // Relation field
        out << relation.name << " " << relation.entity << "[]";
    }
    else if (relation.type == "many-to-many") {
        // Many-to-many relation
        out << relation.name << " " << relation.entity << "[]";
    }
    else if (relation.type == "polymorphic") {
        // Polymorphic relations not directly supported in Prisma
        // Use Json field or multiple optional relations
        out << relation.name << " Json?";
    }

    return out.str();
}

std::string PrismaRelationGenerator::generateOnDelete(const std::string& action) {
    if (action == "cascade") {
        return "Cascade";
    } else if (action == "set_null") {
        return "SetNull";
    } else if (action == "restrict") {
        return "Restrict";
    }
    return "NoAction";
}

} // namespace core
} // namespace dbal
