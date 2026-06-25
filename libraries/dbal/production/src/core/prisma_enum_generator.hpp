#ifndef DBAL_PRISMA_ENUM_GENERATOR_HPP
#define DBAL_PRISMA_ENUM_GENERATOR_HPP

#include <string>
#include <vector>

namespace dbal {
namespace core {

/**
 * Generates Prisma enum definitions
 *
 * Responsible for:
 * - Enum declarations
 * - Enum value definitions
 *
 * Note: Currently a placeholder for future enum support.
 * YAML entity schemas don't have explicit enum definitions yet,
 * but this generator is ready when the schema spec adds them.
 */
class PrismaEnumGenerator {
public:
    /**
     * Generate enum definition
     *
     * @param name Enum name
     * @param values Enum values
     * @return Prisma enum block
     */
    std::string generateEnum(const std::string& name, const std::vector<std::string>& values);
};

} // namespace core
} // namespace dbal

#endif
