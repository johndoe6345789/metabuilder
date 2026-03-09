#include "prisma_model_generator.hpp"
#include <sstream>
#include <map>
#include <spdlog/spdlog.h>

namespace dbal {
namespace core {

std::string PrismaModelGenerator::generateModel(const EntitySchema& schema) {
    std::ostringstream out;

    // Model name (capitalize first letter)
    std::string modelName = schema.name;
    if (!modelName.empty()) {
        modelName[0] = static_cast<char>(std::toupper(static_cast<unsigned char>(modelName[0])));
    }

    out << "model " << modelName << " {\n";

    // Fields
    for (const auto& field : schema.fields) {
        out << "  " << generateField(field) << "\n";
    }

    // Indexes
    std::string indexesSql = generateIndexes(schema);
    if (!indexesSql.empty()) {
        out << "\n" << indexesSql;
    }

    out << "}";

    return out.str();
}

std::string PrismaModelGenerator::generateField(const EntityField& field) {
    std::ostringstream out;

    out << field.name << " " << fieldTypeToPrisma(field.type);

    // Nullable
    if (field.nullable) {
        out << "?";
    }

    // Attributes
    std::string attrs = generateFieldAttributes(field);
    if (!attrs.empty()) {
        out << " " << attrs;
    }

    return out.str();
}

std::string PrismaModelGenerator::fieldTypeToPrisma(const std::string& type) {
    static const std::map<std::string, std::string> typeMap = {
        {"uuid", "String"},
        {"cuid", "String"},
        {"string", "String"},
        {"text", "String"},
        {"email", "String"},
        {"integer", "Int"},
        {"bigint", "BigInt"},
        {"float", "Float"},
        {"decimal", "Decimal"},
        {"boolean", "Boolean"},
        {"timestamp", "DateTime"},
        {"date", "DateTime"},
        {"datetime", "DateTime"},
        {"json", "Json"},
        {"enum", "String"},  // Will be overridden with enum name
        {"bytes", "Bytes"},
    };

    auto it = typeMap.find(type);
    if (it != typeMap.end()) {
        return it->second;
    }

    // Unknown type - use String as fallback
    spdlog::warn("Unknown field type '{}', using String", type);
    return "String";
}

std::string PrismaModelGenerator::generateFieldAttributes(const EntityField& field) {
    std::vector<std::string> attrs;

    // Primary key
    if (field.primary) {
        attrs.push_back("@id");
    }

    // Auto-generated
    if (field.generated) {
        if (field.type == "uuid") {
            attrs.push_back("@default(uuid())");
        } else if (field.type == "cuid") {
            attrs.push_back("@default(cuid())");
        } else if (field.type == "bigint" || field.type == "timestamp") {
            attrs.push_back("@default(now())");
        } else if (field.type == "integer") {
            attrs.push_back("@default(autoincrement())");
        }
    }

    // Default value
    if (field.defaultValue && !field.generated) {
        std::string defVal = *field.defaultValue;
        if (field.type == "string" || field.type == "text" || field.type == "email") {
            attrs.push_back("@default(\"" + defVal + "\")");
        } else if (field.type == "boolean") {
            attrs.push_back("@default(" + defVal + ")");
        } else if (field.type == "integer" || field.type == "bigint" || field.type == "float") {
            attrs.push_back("@default(" + defVal + ")");
        }
    }

    // Unique
    if (field.unique) {
        attrs.push_back("@unique");
    }

    // Field name mapping (if different from Prisma conventions)
    // e.g., tenantId → @map("tenant_id")
    if (field.name.find("Id") != std::string::npos && field.name != "id") {
        std::string dbName;
        for (size_t i = 0; i < field.name.length(); ++i) {
            char c = field.name[i];
            if (std::isupper(static_cast<unsigned char>(c)) && i > 0) {
                dbName += "_";
                dbName += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
            } else {
                dbName += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
            }
        }
        if (dbName != field.name) {
            attrs.push_back("@map(\"" + dbName + "\")");
        }
    }

    // Join attributes with space
    std::ostringstream out;
    for (size_t i = 0; i < attrs.size(); ++i) {
        if (i > 0) out << " ";
        out << attrs[i];
    }

    return out.str();
}

std::string PrismaModelGenerator::generateIndexes(const EntitySchema& schema) {
    if (schema.indexes.empty()) {
        return "";
    }

    std::ostringstream out;

    for (const auto& index : schema.indexes) {
        out << "  @@index([";
        for (size_t i = 0; i < index.fields.size(); ++i) {
            if (i > 0) out << ", ";
            out << index.fields[i];
        }
        out << "]";

        if (index.unique) {
            out << ", type: Unique";
        }

        if (index.name.has_value()) {
            out << ", name: \"" << *index.name << "\"";
        }

        out << ")\n";
    }

    return out.str();
}

} // namespace core
} // namespace dbal
