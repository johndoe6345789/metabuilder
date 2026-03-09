#include "table_creator_action.hpp"
#include "schema_loader_action.hpp"
#include "schema_validator_action.hpp"

#include <algorithm>
#include <cctype>
#include <fstream>
#include <sstream>

namespace dbal {
namespace daemon {
namespace actions {

std::string TableCreatorAction::to_pascal_case(const std::string& snake_case) {
    std::string result;
    bool capitalize_next = true;

    for (char c : snake_case) {
        if (c == '_') {
            capitalize_next = true;
        } else if (capitalize_next) {
            result += static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
            capitalize_next = false;
        } else {
            result += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
        }
    }

    return result;
}

std::string TableCreatorAction::get_prefixed_name(const std::string& packageId, const std::string& entity_name) {
    return "Pkg_" + to_pascal_case(packageId) + "_" + entity_name;
}

std::string TableCreatorAction::get_table_name(const std::string& packageId, const std::string& entity_name) {
    std::string lower_entity = entity_name;
    std::transform(lower_entity.begin(), lower_entity.end(), lower_entity.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return packageId + "_" + lower_entity;
}

std::string TableCreatorAction::yaml_type_to_prisma(const std::string& yaml_type) {
    if (yaml_type == "String" || yaml_type == "string") return "String";
    if (yaml_type == "Int" || yaml_type == "int" || yaml_type == "integer") return "Int";
    if (yaml_type == "Float" || yaml_type == "float" || yaml_type == "double") return "Float";
    if (yaml_type == "Boolean" || yaml_type == "boolean" || yaml_type == "bool") return "Boolean";
    if (yaml_type == "DateTime" || yaml_type == "datetime" || yaml_type == "timestamp") return "DateTime";
    if (yaml_type == "Json" || yaml_type == "json" || yaml_type == "object") return "Json";
    if (yaml_type == "BigInt" || yaml_type == "bigint") return "BigInt";
    return "String";
}

std::string TableCreatorAction::entity_to_prisma(const ::Json::Value& entity, const std::string& packageId) {
    const std::string name = entity["name"].asString();
    const std::string prefixed = get_prefixed_name(packageId, name);
    const std::string table = get_table_name(packageId, name);

    std::ostringstream oss;
    oss << "model " << prefixed << " {\n";

    // Fields
    const auto& fields = entity["fields"];
    for (const auto& field_name : fields.getMemberNames()) {
        const auto& field = fields[field_name];

        oss << "  " << field_name << " ";
        oss << yaml_type_to_prisma(field.get("type", "String").asString());

        if (field.get("nullable", false).asBool()) {
            oss << "?";
        }

        // Attributes
        if (field.get("primary", false).asBool()) {
            oss << " @id";
        }
        if (field.get("generated", false).asBool()) {
            oss << " @default(cuid())";
        }
        if (field.get("unique", false).asBool()) {
            oss << " @unique";
        }

        oss << "\n";
    }

    // Table mapping
    oss << "\n  @@map(\"" << table << "\")\n";
    oss << "}\n";

    return oss.str();
}

void TableCreatorAction::handle_generate(const std::string& registry_path,
                                         const std::string& output_path,
                                         ResponseSender send_success,
                                         ErrorSender send_error) {
    try {
        auto registry = SchemaLoaderAction::load_registry(registry_path);
        auto approved = SchemaLoaderAction::get_approved_migrations(registry);

        if (approved.empty()) {
            ::Json::Value response;
            response["status"] = "ok";
            response["action"] = "generate";
            response["generated"] = false;
            response["message"] = "No approved migrations to generate";
            send_success(response);
            return;
        }

        std::ostringstream oss;
        oss << "// Auto-generated from package schemas\n";
        oss << "// DO NOT EDIT MANUALLY\n";
        oss << "// Generated at: " << SchemaValidatorAction::get_iso_timestamp() << "\n\n";

        for (const auto& migration : approved) {
            const std::string pkg_id = migration["packageId"].asString();
            oss << "// Package: " << pkg_id << "\n";

            const auto& entities = migration["entities"];
            for (const auto& entity : entities) {
                oss << entity_to_prisma(entity, pkg_id) << "\n";
            }
        }

        // Write to file
        std::ofstream out(output_path);
        if (!out.is_open()) {
            send_error("Failed to write output file: " + output_path, 500);
            return;
        }
        out << oss.str();
        out.close();

        ::Json::Value response;
        response["status"] = "ok";
        response["action"] = "generate";
        response["generated"] = true;
        response["path"] = output_path;
        response["migrationCount"] = static_cast<int>(approved.size());
        response["nextStep"] = "Run: npx prisma migrate dev --name package-schemas";

        send_success(response);
    } catch (const std::exception& e) {
        send_error(std::string("Generate failed: ") + e.what(), 500);
    }
}

} // namespace actions
} // namespace daemon
} // namespace dbal
