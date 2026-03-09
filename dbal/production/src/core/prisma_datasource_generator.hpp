#ifndef DBAL_PRISMA_DATASOURCE_GENERATOR_HPP
#define DBAL_PRISMA_DATASOURCE_GENERATOR_HPP

#include <string>

namespace dbal {
namespace core {

/**
 * Generates Prisma datasource and client configuration blocks
 *
 * Responsible for:
 * - Datasource block (provider, url)
 * - Client generator block (provider, output)
 */
class PrismaDatasourceGenerator {
public:
    /**
     * Generate datasource block
     *
     * @return Prisma datasource block with PostgreSQL provider
     */
    std::string generateDatasource();

    /**
     * Generate client generator block
     *
     * @return Prisma client generator configuration
     */
    std::string generateClient();
};

} // namespace core
} // namespace dbal

#endif
