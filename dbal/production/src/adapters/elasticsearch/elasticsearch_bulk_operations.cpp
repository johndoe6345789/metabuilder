#include "elasticsearch_bulk_operations.hpp"
#include "elasticsearch_type_converter.hpp"

namespace dbal {
namespace adapters {
namespace elasticsearch {

std::vector<std::string> ElasticsearchBulkOperations::buildIndexOperations(
    const std::string& index_name,
    const std::vector<Json>& records) {

    std::vector<std::string> ndjson_lines;
    ndjson_lines.reserve(records.size() * 2);

    for (const auto& record : records) {
        // Generate ID if not provided
        std::string id;
        if (record.contains("id") && !record["id"].is_null()) {
            id = record["id"].get<std::string>();
        } else {
            id = ElasticsearchTypeConverter::generateId();
        }

        // Add complete record with ID
        Json doc = record;
        doc["id"] = id;

        // Build action
        Json action = {
            {"index", {
                {"_index", index_name},
                {"_id", id}
            }}
        };

        ndjson_lines.push_back(action.dump());
        ndjson_lines.push_back(doc.dump());
    }

    return ndjson_lines;
}

std::vector<std::string> ElasticsearchBulkOperations::buildUpdateOperations(
    const std::string& index_name,
    const std::vector<Json>& records,
    const Json& update_data) {

    std::vector<std::string> ndjson_lines;
    ndjson_lines.reserve(records.size() * 2);

    for (const auto& record : records) {
        if (!record.contains("id")) {
            continue;
        }

        std::string id = record["id"].get<std::string>();

        // Merge updates
        Json updated_doc = record;
        for (auto it = update_data.begin(); it != update_data.end(); ++it) {
            updated_doc[it.key()] = it.value();
        }

        // Build action
        Json action = {
            {"update", {
                {"_index", index_name},
                {"_id", id}
            }}
        };

        Json update_body = {
            {"doc", updated_doc}
        };

        ndjson_lines.push_back(action.dump());
        ndjson_lines.push_back(update_body.dump());
    }

    return ndjson_lines;
}

std::vector<std::string> ElasticsearchBulkOperations::buildDeleteOperations(
    const std::string& index_name,
    const std::vector<Json>& records) {

    std::vector<std::string> ndjson_lines;
    ndjson_lines.reserve(records.size());

    for (const auto& record : records) {
        if (!record.contains("id")) {
            continue;
        }

        std::string id = record["id"].get<std::string>();

        Json action = {
            {"delete", {
                {"_index", index_name},
                {"_id", id}
            }}
        };

        ndjson_lines.push_back(action.dump());
    }

    return ndjson_lines;
}

int ElasticsearchBulkOperations::countSuccesses(const Json& bulk_response, const std::string& operation_type) {
    int count = 0;

    if (!bulk_response.contains("items") || !bulk_response["items"].is_array()) {
        return 0;
    }

    for (const auto& item : bulk_response["items"]) {
        if (item.contains(operation_type)) {
            auto op_result = item[operation_type];
            int status = op_result.value("status", 0);
            if (status >= 200 && status < 300) {
                count++;
            }
        }
    }

    return count;
}

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal
