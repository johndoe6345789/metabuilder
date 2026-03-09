#include "prisma_enum_generator.hpp"
#include <sstream>

namespace dbal {
namespace core {

std::string PrismaEnumGenerator::generateEnum(const std::string& name, const std::vector<std::string>& values) {
    std::ostringstream out;

    out << "enum " << name << " {\n";

    for (const auto& value : values) {
        out << "  " << value << "\n";
    }

    out << "}";

    return out.str();
}

} // namespace core
} // namespace dbal
