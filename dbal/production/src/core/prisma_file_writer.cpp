#include "prisma_file_writer.hpp"
#include <fstream>
#include <spdlog/spdlog.h>

#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#endif

namespace dbal {
namespace core {

std::filesystem::path PrismaFileWriter::getTempDir() {
#ifdef _WIN32
    // Windows: %TEMP%\dbal-prisma
    char tempPath[MAX_PATH];
    GetTempPathA(MAX_PATH, tempPath);
    std::filesystem::path dir(tempPath);
    dir /= "dbal-prisma";
#else
    // Linux/macOS: /tmp/dbal-prisma
    std::filesystem::path dir("/tmp/dbal-prisma");
#endif

    // Create directory if it doesn't exist
    if (!std::filesystem::exists(dir)) {
        std::filesystem::create_directories(dir);
    }

    return dir;
}

std::filesystem::path PrismaFileWriter::writeToTempFile(const std::string& schema) {
    auto tempDir = getTempDir();
    auto schemaPath = tempDir / "schema.prisma";

    try {
        std::ofstream file(schemaPath);
        if (!file) {
            throw std::runtime_error("Failed to open " + schemaPath.string());
        }

        file << schema;
        file.close();

        spdlog::info("Generated Prisma schema: {}", schemaPath.string());
        return schemaPath;
    } catch (const std::exception& e) {
        spdlog::error("Failed to write Prisma schema: {}", e.what());
        throw;
    }
}

} // namespace core
} // namespace dbal
