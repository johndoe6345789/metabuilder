#ifndef DBAL_PRISMA_FILE_WRITER_HPP
#define DBAL_PRISMA_FILE_WRITER_HPP

#include <string>
#include <filesystem>

namespace dbal {
namespace core {

/**
 * Handles file I/O operations for Prisma schema generation
 *
 * Responsible for:
 * - Platform-specific temp directory resolution
 * - File writing with error handling
 * - Directory creation
 */
class PrismaFileWriter {
public:
    /**
     * Get platform-specific temp directory for Prisma files
     *
     * @return Path to temp directory (creates if doesn't exist)
     *
     * Locations:
     *   - Linux/macOS: /tmp/dbal-prisma/
     *   - Windows: %TEMP%\dbal-prisma\
     */
    static std::filesystem::path getTempDir();

    /**
     * Write Prisma schema to platform-specific temp directory
     *
     * @param schema Prisma schema content
     * @return Path to generated schema.prisma file
     * @throws std::runtime_error if file write fails
     */
    static std::filesystem::path writeToTempFile(const std::string& schema);
};

} // namespace core
} // namespace dbal

#endif
