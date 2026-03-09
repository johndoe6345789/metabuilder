#pragma once

#include <string>
#include <vector>
#include <map>
#include <optional>
#include <algorithm>
#include <cctype>
#include <fstream>
#include <nlohmann/json.hpp>
#include <filesystem>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {

struct FieldDefinition {
    std::string name;
    std::string type;
    bool primary = false;
    bool required = false;
    bool unique = false;
    bool generated = false;
    bool optional = false;
    bool nullable = false;
    std::optional<std::string> default_value;
    std::optional<int> min_length;
    std::optional<int> max_length;
    std::optional<std::string> pattern;
    std::vector<std::string> enum_values;
};

struct IndexDefinition {
    std::vector<std::string> fields;
    bool unique = false;
};

struct RelationDefinition {
    std::string name;
    std::string type;           // "has-many" | "belongs-to"
    std::string entity;         // target entity name
    std::string foreign_key;
    bool cascade_delete = false;
};

// Separate from adapters::QueryConfig to avoid ODR violation — fields copied in sql_adapter_schema.cpp
struct SchemaQueryConfig {
    std::vector<std::string> allowed_operators;
    std::vector<std::string> allowed_group_by;
    std::vector<std::string> allowed_includes;
    int max_results = 1000;
    int timeout_ms = 0;
};

struct EntityDefinition {
    std::string name;
    std::string version;
    std::string description;
    std::vector<FieldDefinition> fields;
    std::vector<IndexDefinition> indexes;
    std::vector<RelationDefinition> relations;
    SchemaQueryConfig query_config;
};

/**
 * Loads entity schemas from JSON files
 */
class SchemaLoader {
public:
    static std::optional<EntityDefinition> loadFromFile(const std::string& file_path) {
        try {
            std::ifstream f(file_path);
            if (!f.is_open()) return std::nullopt;
            nlohmann::json root = nlohmann::json::parse(f);
            // Use first element if file contains an array of entities
            nlohmann::json json = (root.is_array() && !root.empty()) ? root[0] : root;

            EntityDefinition entity;
            if (json.contains("entity")) {
                entity.name = json["entity"].get<std::string>();
            } else if (json.contains("displayName")) {
                entity.name = json["displayName"].get<std::string>();
            } else if (json.contains("name")) {
                std::string raw_name = json["name"].get<std::string>();
                if (!raw_name.empty())
                    raw_name[0] = static_cast<char>(std::toupper(static_cast<unsigned char>(raw_name[0])));
                entity.name = raw_name;
            } else {
                return std::nullopt;
            }
            entity.version     = json.value("version",     std::string("1.0"));
            entity.description = json.value("description", std::string(""));

            if (json.contains("fields")) {
                for (auto& [field_name, field_def] : json["fields"].items()) {
                    FieldDefinition field;
                    field.name = field_name;

                    std::string field_type = field_def.value("type", std::string("string"));
                    std::transform(field_type.begin(), field_type.end(), field_type.begin(),
                                   [](unsigned char c) { return std::tolower(c); });

                    if (field_type == "relationship") continue;
                    if (field_type == "datetime")     field_type = "bigint";
                    if (field_type == "number")       field_type = "bigint";

                    field.type      = field_type;
                    field.primary   = field_def.value("primary",    false) ||
                                      field_def.value("primaryKey", false);
                    field.required  = field_def.value("required",   false);
                    field.unique    = field_def.value("unique",      false);
                    field.generated = field_def.value("generated",  false);
                    field.optional  = field_def.value("optional",   false);
                    field.nullable  = field_def.value("nullable",   false);

                    if (field_def.contains("default")) {
                        const auto& def_node = field_def["default"];
                        if (def_node.is_string())
                            field.default_value = def_node.get<std::string>();
                        else if (!def_node.is_null() && !def_node.is_object() && !def_node.is_array())
                            field.default_value = def_node.dump();
                    }
                    auto get_len = [&](const char* snake, const char* camel) -> std::optional<int> {
                        if (field_def.contains(snake)) return field_def[snake].get<int>();
                        if (field_def.contains(camel)) return field_def[camel].get<int>();
                        return std::nullopt;
                    };
                    field.min_length = get_len("min_length", "minLength");
                    field.max_length = get_len("max_length", "maxLength");
                    if (field_def.contains("pattern"))
                        field.pattern = field_def["pattern"].get<std::string>();
                    if (field_def.contains("values")) {
                        for (const auto& val : field_def["values"])
                            field.enum_values.push_back(val.get<std::string>());
                    }

                    entity.fields.push_back(field);
                }
            }

            // Auto-add tenantId field if top-level tenantId: true is set
            if (json.contains("tenantId") && json["tenantId"].is_boolean()) {
                if (json["tenantId"].get<bool>()) {
                    bool has_tenant = false;
                    for (const auto& f : entity.fields)
                        if (f.name == "tenantId") { has_tenant = true; break; }
                    if (!has_tenant) {
                        FieldDefinition tenant_field;
                        tenant_field.name     = "tenantId";
                        tenant_field.type     = "string";
                        tenant_field.required = false;
                        tenant_field.nullable = true;
                        entity.fields.push_back(tenant_field);
                    }
                }
            }

            if (json.contains("indexes")) {
                for (const auto& index_node : json["indexes"]) {
                    IndexDefinition index;
                    if (index_node.contains("fields")) {
                        for (const auto& f : index_node["fields"])
                            index.fields.push_back(f.get<std::string>());
                    }
                    index.unique = index_node.value("unique", false);
                    entity.indexes.push_back(index);
                }
            }

            // Parse "relations" object: { "snippets": { "type": "has-many", "entity": "Snippet", ... } }
            if (json.contains("relations") && json["relations"].is_object()) {
                for (auto& [rel_name, rel_def] : json["relations"].items()) {
                    RelationDefinition rel;
                    rel.name         = rel_name;
                    rel.type         = rel_def.value("type", std::string("has-many"));
                    rel.entity       = rel_def.value("entity", std::string(""));
                    rel.foreign_key  = rel_def.value("foreign_key", std::string(""));
                    rel.cascade_delete = rel_def.value("cascade_delete", false);
                    if (!rel.entity.empty()) entity.relations.push_back(rel);
                }
            }

            // Parse "query" object: allowed_operators, allowed_group_by, allowed_includes, max_results, timeout_ms
            if (json.contains("query") && json["query"].is_object()) {
                const auto& q = json["query"];
                auto parse_str_array = [&](const char* key, std::vector<std::string>& out) {
                    if (q.contains(key) && q[key].is_array())
                        for (const auto& v : q[key]) out.push_back(v.get<std::string>());
                };
                parse_str_array("allowed_operators", entity.query_config.allowed_operators);
                parse_str_array("allowed_group_by",  entity.query_config.allowed_group_by);
                parse_str_array("allowed_includes",  entity.query_config.allowed_includes);
                entity.query_config.max_results = q.value("max_results", 1000);
                entity.query_config.timeout_ms  = q.value("timeout_ms",  0);
            }

            return entity;

        } catch (const nlohmann::json::parse_error& e) {
            spdlog::warn("Failed to parse JSON {}: {}", file_path, e.what());
            return std::nullopt;
        } catch (const std::exception& e) {
            spdlog::warn("Failed to load entity from {}: {}", file_path, e.what());
            return std::nullopt;
        }
    }

    static std::vector<EntityDefinition> loadFromDirectory(const std::string& dir_path) {
        std::vector<EntityDefinition> entities;
        if (!std::filesystem::exists(dir_path)) return entities;

        for (const auto& entry : std::filesystem::recursive_directory_iterator(dir_path)) {
            if (!entry.is_regular_file() || entry.path().extension() != ".json") continue;
            if (entry.path().filename() == "entities.json") continue;
            try {
                std::ifstream f(entry.path().string());
                if (!f.is_open()) continue;
                nlohmann::json root = nlohmann::json::parse(f);
                nlohmann::json docs = root.is_array() ? root : nlohmann::json::array({root});
                for (const auto& node : docs) {
                    if (!node.is_object()) continue;
                    // Inline parse to avoid array-truncation in loadFromFile
                    nlohmann::json json = node;
                    EntityDefinition entity;
                    if (json.contains("entity"))          entity.name = json["entity"].get<std::string>();
                    else if (json.contains("displayName")) entity.name = json["displayName"].get<std::string>();
                    else if (json.contains("name"))        entity.name = json["name"].get<std::string>();
                    else continue;
                    entity.version     = json.value("version",     std::string("1.0"));
                    entity.description = json.value("description", std::string(""));
                    if (json.contains("fields")) {
                        for (auto& [fn, fd] : json["fields"].items()) {
                            FieldDefinition field;
                            field.name = fn;
                            std::string ft = fd.value("type", std::string("string"));
                            std::transform(ft.begin(), ft.end(), ft.begin(),
                                           [](unsigned char c){return std::tolower(c);});
                            if (ft == "relationship") continue;
                            if (ft == "datetime") ft = "bigint";
                            if (ft == "number")   ft = "bigint";
                            field.type      = ft;
                            field.primary   = fd.value("primary",   false) || fd.value("primaryKey", false);
                            field.required  = fd.value("required",  false);
                            field.unique    = fd.value("unique",    false);
                            field.generated = fd.value("generated", false);
                            field.optional  = fd.value("optional",  false);
                            field.nullable  = fd.value("nullable",  false);
                            if (fd.contains("default")) {
                                const auto& dv = fd["default"];
                                if (dv.is_string())
                                    field.default_value = dv.get<std::string>();
                                else if (!dv.is_null() && !dv.is_object() && !dv.is_array())
                                    field.default_value = dv.dump();
                            }
                            if (fd.contains("values") && fd["values"].is_array()) {
                                for (const auto& val : fd["values"])
                                    field.enum_values.push_back(val.get<std::string>());
                            }
                            entity.fields.push_back(field);
                        }
                    }
                    if (json.contains("indexes")) {
                        for (const auto& idx : json["indexes"]) {
                            IndexDefinition index;
                            if (idx.contains("fields"))
                                for (const auto& ff : idx["fields"]) index.fields.push_back(ff.get<std::string>());
                            index.unique = idx.value("unique", false);
                            entity.indexes.push_back(index);
                        }
                    }
                    if (json.contains("relations") && json["relations"].is_object()) {
                        for (auto& [rn, rd] : json["relations"].items()) {
                            RelationDefinition rel;
                            rel.name         = rn;
                            rel.type         = rd.value("type",        std::string("has-many"));
                            rel.entity       = rd.value("entity",      std::string(""));
                            rel.foreign_key  = rd.value("foreign_key", std::string(""));
                            rel.cascade_delete = rd.value("cascade_delete", false);
                            if (!rel.entity.empty()) entity.relations.push_back(rel);
                        }
                    }
                    if (json.contains("query") && json["query"].is_object()) {
                        const auto& q = json["query"];
                        auto psa = [&](const char* key, std::vector<std::string>& out) {
                            if (q.contains(key) && q[key].is_array())
                                for (const auto& v : q[key]) out.push_back(v.get<std::string>());
                        };
                        psa("allowed_operators", entity.query_config.allowed_operators);
                        psa("allowed_group_by",  entity.query_config.allowed_group_by);
                        psa("allowed_includes",  entity.query_config.allowed_includes);
                        entity.query_config.max_results = q.value("max_results", 1000);
                        entity.query_config.timeout_ms  = q.value("timeout_ms",  0);
                    }
                    entities.push_back(entity);
                }
            } catch (...) {}
        }
        return entities;
    }
};

} // namespace adapters
} // namespace dbal
