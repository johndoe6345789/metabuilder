#ifndef DBAL_PRISMA_GENERATOR_HPP
#define DBAL_PRISMA_GENERATOR_HPP

#include <string>
#include <map>
#include <filesystem>
#include "dbal/core/entity_loader.hpp"
#include "prisma_model_generator.hpp"
#include "prisma_relation_generator.hpp"
#include "prisma_datasource_generator.hpp"
#include "prisma_enum_generator.hpp"
#include "prisma_file_writer.hpp"

namespace dbal {
namespace core {

/**
 * Orchestrates Prisma schema generation from YAML entity definitions
 *
 * Clean Architecture Pattern:
 * - Delegates model generation to PrismaModelGenerator
 * - Delegates relation generation to PrismaRelationGenerator
 * - Delegates datasource/client to PrismaDatasourceGenerator
 * - Delegates enum generation to PrismaEnumGenerator
 * - Delegates file I/O to PrismaFileWriter
 *
 * Usage:
 *   PrismaGenerator generator;
 *   std::string schema = generator.generateSchema(schemas);
 *   auto path = generator.writeToTempFile(schema);
 */
class PrismaGenerator {
public:
    /**
     * Generate complete Prisma schema from entity schemas
     *
     * @param schemas Map of entity name → EntitySchema
     * @return Complete Prisma schema.prisma file content
     */
    std::string generateSchema(const std::map<std::string, EntitySchema>& schemas);

    /**
     * Write Prisma schema to platform-specific temp directory
     *
     * @param schema Prisma schema content
     * @return Path to generated schema.prisma file
     *
     * Locations:
     *   - Linux/macOS: /tmp/dbal-prisma/schema.prisma
     *   - Windows: %TEMP%\dbal-prisma\schema.prisma
     */
    std::filesystem::path writeToTempFile(const std::string& schema);

    /**
     * Get platform-specific temp directory for Prisma files
     */
    static std::filesystem::path getTempDir();

private:
    PrismaModelGenerator modelGenerator;
    PrismaRelationGenerator relationGenerator;
    PrismaDatasourceGenerator datasourceGenerator;
    PrismaEnumGenerator enumGenerator;
};

} // namespace core
} // namespace dbal

#endif
