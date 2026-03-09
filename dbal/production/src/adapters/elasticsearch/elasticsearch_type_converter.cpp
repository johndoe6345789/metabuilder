#include "elasticsearch_type_converter.hpp"
#include <uuid/uuid.h>
#include <algorithm>

namespace dbal {
namespace adapters {
namespace elasticsearch {

Json ElasticsearchTypeConverter::convertFieldType(const std::string& dbal_type) {
    Json field_mapping;

    if (dbal_type == "string") {
        field_mapping["type"] = "text";
        field_mapping["fields"] = {
            {"keyword", {{"type", "keyword"}}}  // Multi-field for exact match
        };
    } else if (dbal_type == "number") {
        field_mapping["type"] = "double";
    } else if (dbal_type == "boolean") {
        field_mapping["type"] = "boolean";
    } else if (dbal_type == "timestamp") {
        field_mapping["type"] = "date";
    } else if (dbal_type == "json") {
        field_mapping["type"] = "object";
        field_mapping["enabled"] = true;
    } else {
        field_mapping["type"] = "keyword";  // Default to keyword
    }

    return field_mapping;
}

std::string ElasticsearchTypeConverter::toIndexName(const std::string& entity_name) {
    std::string index = entity_name;
    std::transform(index.begin(), index.end(), index.begin(), ::tolower);
    return index;
}

std::string ElasticsearchTypeConverter::makeDocumentPath(const std::string& index_name,
                                                          const std::string& document_type,
                                                          const std::string& id) {
    if (id.empty()) {
        return "/" + index_name + "/" + document_type;
    }
    return "/" + index_name + "/" + document_type + "/" + id;
}

std::string ElasticsearchTypeConverter::makeSearchPath(const std::string& index_name) {
    return "/" + index_name + "/_search";
}

std::string ElasticsearchTypeConverter::generateId() {
    uuid_t uuid;
    uuid_generate(uuid);
    char uuid_str[37];
    uuid_unparse_lower(uuid, uuid_str);
    return std::string(uuid_str);
}

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal
