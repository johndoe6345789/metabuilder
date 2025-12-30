#include "rpc_schema_actions.hpp"

#include <algorithm>
#include <chrono>
#include <ctime>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <sstream>

namespace fs = std::filesystem;

namespace dbal {
namespace daemon {
namespace rpc {

namespace {

/**
 * @brief Load schema registry from JSON file
 */
Json::Value load_registry(const std::string& path) {
    Json::Value registry;
    
    if (!fs::exists(path)) {
        registry["version"] = "1.0.0";
        registry["packages"] = Json::Value(Json::objectValue);
        registry["migrationQueue"] = Json::Value(Json::arrayValue);
        return registry;
    }
    
    std::ifstream file(path);
    if (!file.is_open()) {
        registry["version"] = "1.0.0";
        registry["packages"] = Json::Value(Json::objectValue);
        registry["migrationQueue"] = Json::Value(Json::arrayValue);
        return registry;
    }
    
    Json::CharReaderBuilder reader;
    JSONCPP_STRING errs;
    if (!Json::parseFromStream(reader, file, &registry, &errs)) {
        registry["version"] = "1.0.0";
        registry["packages"] = Json::Value(Json::objectValue);
        registry["migrationQueue"] = Json::Value(Json::arrayValue);
    }
    
    return registry;
}

/**
 * @brief Save schema registry to JSON file
 */
bool save_registry(const Json::Value& registry, const std::string& path) {
    std::ofstream file(path);
    if (!file.is_open()) {
        return false;
    }
    
    Json::StreamWriterBuilder writer;
    writer["indentation"] = "  ";
    std::unique_ptr<Json::StreamWriter> stream_writer(writer.newStreamWriter());
    stream_writer->write(registry, &file);
    return true;
}

/**
 * @brief Get current ISO timestamp
 */
std::string get_iso_timestamp() {
    auto now = std::chrono::system_clock::now();
    auto time_t_now = std::chrono::system_clock::to_time_t(now);
    std::tm tm_now{};
#ifdef _WIN32
    gmtime_s(&tm_now, &time_t_now);
#else
    gmtime_r(&time_t_now, &tm_now);
#endif
    std::ostringstream oss;
    oss << std::put_time(&tm_now, "%Y-%m-%dT%H:%M:%SZ");
    return oss.str();
}

/**
 * @brief Convert package name to PascalCase
 */
std::string to_pascal_case(const std::string& snake_case) {
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

/**
 * @brief Get prefixed entity name
 */
std::string get_prefixed_name(const std::string& package_id, const std::string& entity_name) {
    return "Pkg_" + to_pascal_case(package_id) + "_" + entity_name;
}

/**
 * @brief Get table name for entity
 */
std::string get_table_name(const std::string& package_id, const std::string& entity_name) {
    std::string lower_entity = entity_name;
    std::transform(lower_entity.begin(), lower_entity.end(), lower_entity.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return package_id + "_" + lower_entity;
}

/**
 * @brief Get pending migrations from registry
 */
Json::Value get_pending_migrations(const Json::Value& registry) {
    Json::Value pending(Json::arrayValue);
    
    const auto& queue = registry["migrationQueue"];
    for (const auto& migration : queue) {
        if (migration["status"].asString() == "pending") {
            pending.append(migration);
        }
    }
    
    return pending;
}

/**
 * @brief Get approved migrations from registry
 */
Json::Value get_approved_migrations(const Json::Value& registry) {
    Json::Value approved(Json::arrayValue);
    
    const auto& queue = registry["migrationQueue"];
    for (const auto& migration : queue) {
        if (migration["status"].asString() == "approved") {
            approved.append(migration);
        }
    }
    
    return approved;
}

/**
 * @brief Map YAML type to Prisma type
 */
std::string yaml_type_to_prisma(const std::string& yaml_type) {
    if (yaml_type == "String" || yaml_type == "string") return "String";
    if (yaml_type == "Int" || yaml_type == "int" || yaml_type == "integer") return "Int";
    if (yaml_type == "Float" || yaml_type == "float" || yaml_type == "double") return "Float";
    if (yaml_type == "Boolean" || yaml_type == "boolean" || yaml_type == "bool") return "Boolean";
    if (yaml_type == "DateTime" || yaml_type == "datetime" || yaml_type == "timestamp") return "DateTime";
    if (yaml_type == "Json" || yaml_type == "json" || yaml_type == "object") return "Json";
    if (yaml_type == "BigInt" || yaml_type == "bigint") return "BigInt";
    return "String";
}

/**
 * @brief Generate Prisma model for an entity
 */
std::string entity_to_prisma(const Json::Value& entity, const std::string& package_id) {
    const std::string name = entity["name"].asString();
    const std::string prefixed = get_prefixed_name(package_id, name);
    const std::string table = get_table_name(package_id, name);
    
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

} // anonymous namespace

void handle_schema_list(const std::string& registry_path,
                        ResponseSender send_success,
                        ErrorSender send_error) {
    try {
        auto registry = load_registry(registry_path);
        auto pending = get_pending_migrations(registry);
        
        Json::Value response;
        response["status"] = "ok";
        response["pendingCount"] = pending.size();
        response["migrations"] = pending;
        response["packages"] = registry["packages"];
        
        send_success(response);
    } catch (const std::exception& e) {
        send_error(std::string("Failed to load registry: ") + e.what(), 500);
    }
}

void handle_schema_scan(const std::string& registry_path,
                        const std::string& packages_path,
                        ResponseSender send_success,
                        ErrorSender send_error) {
    try {
        auto registry = load_registry(registry_path);
        
        int scanned = 0;
        int queued = 0;
        Json::Value errors(Json::arrayValue);
        
        if (!fs::exists(packages_path)) {
            send_error("Packages directory not found: " + packages_path, 404);
            return;
        }
        
        for (const auto& entry : fs::directory_iterator(packages_path)) {
            if (!entry.is_directory()) continue;
            
            const std::string pkg_name = entry.path().filename().string();
            const fs::path schema_path = entry.path() / "seed" / "schema" / "entities.yaml";
            
            if (!fs::exists(schema_path)) continue;
            
            scanned++;
            
            // Note: Full YAML parsing would require a YAML library
            // For now, just detect that schema exists and queue for review
            // The actual parsing is done by the Next.js API
        }
        
        save_registry(registry, registry_path);
        
        Json::Value response;
        response["status"] = "ok";
        response["action"] = "scan";
        response["packagesScanned"] = scanned;
        response["changesQueued"] = queued;
        response["errors"] = errors;
        response["note"] = "Full schema parsing delegated to Next.js API";
        
        send_success(response);
    } catch (const std::exception& e) {
        send_error(std::string("Scan failed: ") + e.what(), 500);
    }
}

void handle_schema_approve(const std::string& registry_path,
                           const std::string& id,
                           ResponseSender send_success,
                           ErrorSender send_error) {
    try {
        auto registry = load_registry(registry_path);
        auto& queue = registry["migrationQueue"];
        
        int approved_count = 0;
        const std::string timestamp = get_iso_timestamp();
        
        for (auto& migration : queue) {
            if (migration["status"].asString() != "pending") continue;
            
            if (id == "all" || migration["id"].asString() == id) {
                migration["status"] = "approved";
                migration["approvedAt"] = timestamp;
                approved_count++;
                
                if (id != "all") break;
            }
        }
        
        if (approved_count == 0 && id != "all") {
            send_error("Migration not found: " + id, 404);
            return;
        }
        
        save_registry(registry, registry_path);
        
        Json::Value response;
        response["status"] = "ok";
        response["action"] = "approve";
        response["approved"] = approved_count;
        response["message"] = "Approved " + std::to_string(approved_count) + " migration(s)";
        
        send_success(response);
    } catch (const std::exception& e) {
        send_error(std::string("Approve failed: ") + e.what(), 500);
    }
}

void handle_schema_reject(const std::string& registry_path,
                          const std::string& id,
                          ResponseSender send_success,
                          ErrorSender send_error) {
    try {
        auto registry = load_registry(registry_path);
        auto& queue = registry["migrationQueue"];
        
        bool found = false;
        
        for (auto& migration : queue) {
            if (migration["id"].asString() == id && migration["status"].asString() == "pending") {
                migration["status"] = "rejected";
                found = true;
                break;
            }
        }
        
        if (!found) {
            send_error("Migration not found or not pending: " + id, 404);
            return;
        }
        
        save_registry(registry, registry_path);
        
        Json::Value response;
        response["status"] = "ok";
        response["action"] = "reject";
        response["id"] = id;
        response["message"] = "Rejected migration " + id;
        
        send_success(response);
    } catch (const std::exception& e) {
        send_error(std::string("Reject failed: ") + e.what(), 500);
    }
}

void handle_schema_generate(const std::string& registry_path,
                            const std::string& output_path,
                            ResponseSender send_success,
                            ErrorSender send_error) {
    try {
        auto registry = load_registry(registry_path);
        auto approved = get_approved_migrations(registry);
        
        if (approved.empty()) {
            Json::Value response;
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
        oss << "// Generated at: " << get_iso_timestamp() << "\n\n";
        
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
        
        Json::Value response;
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

} // namespace rpc
} // namespace daemon
} // namespace dbal
