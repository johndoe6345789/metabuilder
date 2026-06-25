#ifndef DBAL_PRISMA_RELATION_GENERATOR_HPP
#define DBAL_PRISMA_RELATION_GENERATOR_HPP

#include <string>
#include "dbal/core/relation_def.hpp"

namespace dbal {
namespace core {

/**
 * Generates Prisma relation definitions from entity schemas
 *
 * Responsible for:
 * - belongs-to relations (with @relation directive)
 * - has-one relations
 * - has-many relations
 * - many-to-many relations
 * - Polymorphic relations (mapped to Json)
 * - onDelete/onUpdate actions
 */
class PrismaRelationGenerator {
public:
    /**
     * Generate a single relation field definition
     *
     * @param relation Relation definition
     * @return Prisma relation field (e.g., "user User @relation(fields: [userId], references: [id])")
     */
    std::string generateRelation(const RelationDef& relation);

private:
    /**
     * Convert YAML onDelete/onUpdate action to Prisma action
     *
     * @param action YAML action (cascade, set_null, restrict, no_action)
     * @return Prisma action (Cascade, SetNull, Restrict, NoAction)
     */
    std::string generateOnDelete(const std::string& action);
};

} // namespace core
} // namespace dbal

#endif
