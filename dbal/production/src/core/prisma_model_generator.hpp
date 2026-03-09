#ifndef DBAL_PRISMA_MODEL_GENERATOR_HPP
#define DBAL_PRISMA_MODEL_GENERATOR_HPP

#include <string>
#include <vector>
#include "dbal/core/entity_loader.hpp"

namespace dbal {
namespace core {

/**
 * Generates Prisma model definitions from entity schemas
 *
 * Responsible for:
 * - Model declarations
 * - Field definitions
 * - Field attributes (@id, @default, @unique, etc.)
 * - Field type mapping (YAML → Prisma types)
 * - Index definitions
 */
class PrismaModelGenerator {
public:
    /**
     * Generate a complete Prisma model from entity schema
     *
     * @param schema Entity schema definition
     * @return Prisma model block as string
     */
    std::string generateModel(const EntitySchema& schema);

private:
    /**
     * Generate a single field definition
     *
     * @param field Entity field definition
     * @return Prisma field definition (e.g., "id String @id @default(uuid())")
     */
    std::string generateField(const EntityField& field);

    /**
     * Generate field attributes (@id, @default, @unique, @map)
     *
     * @param field Entity field definition
     * @return Space-separated attributes string
     */
    std::string generateFieldAttributes(const EntityField& field);

    /**
     * Generate index definitions (@@index, @@unique)
     *
     * @param schema Entity schema with index definitions
     * @return Index directives as multi-line string
     */
    std::string generateIndexes(const EntitySchema& schema);

    /**
     * Convert YAML field type to Prisma type
     *
     * @param type YAML field type (uuid, string, integer, etc.)
     * @return Prisma type (String, Int, DateTime, etc.)
     */
    std::string fieldTypeToPrisma(const std::string& type);
};

} // namespace core
} // namespace dbal

#endif
