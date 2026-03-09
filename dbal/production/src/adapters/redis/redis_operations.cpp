#include "redis_operations.hpp"
#include "redis_adapter.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace redis {

RedisOperations::RedisOperations(RedisAdapter& adapter)
    : adapter_(adapter) {
}

Result<int> RedisOperations::createMany(const std::string& entityName, const std::vector<Json>& records) {
    int count = 0;
    for (const auto& record : records) {
        auto result = adapter_.create(entityName, record);
        if (result.isOk()) {
            ++count;
        }
    }
    return count;
}

Result<int> RedisOperations::updateMany(const std::string& entityName, const Json& filter, const Json& data) {
    ListOptions options;
    if (filter.is_object()) {
        for (auto it = filter.begin(); it != filter.end(); ++it) {
            options.filter[it.key()] = it.value().dump();
        }
    }

    auto list_result = adapter_.list(entityName, options);
    if (!list_result.isOk()) {
        return Error(list_result.error().code(), list_result.error().what());
    }

    int count = 0;
    for (const auto& record : list_result.value().items) {
        const std::string id = record["id"].get<std::string>();
        auto update_result = adapter_.update(entityName, id, data);
        if (update_result.isOk()) {
            ++count;
        }
    }
    return count;
}

Result<int> RedisOperations::deleteMany(const std::string& entityName, const Json& filter) {
    ListOptions options;
    if (filter.is_object()) {
        for (auto it = filter.begin(); it != filter.end(); ++it) {
            options.filter[it.key()] = it.value().dump();
        }
    }

    auto list_result = adapter_.list(entityName, options);
    if (!list_result.isOk()) {
        return Error(list_result.error().code(), list_result.error().what());
    }

    int count = 0;
    for (const auto& record : list_result.value().items) {
        const std::string id = record["id"].get<std::string>();
        auto delete_result = adapter_.remove(entityName, id);
        if (delete_result.isOk()) {
            ++count;
        }
    }
    return count;
}

Result<Json> RedisOperations::findFirst(const std::string& entityName, const Json& filter) {
    ListOptions options;
    options.filter = filter;
    options.limit = 1;

    auto list_result = adapter_.list(entityName, options);
    if (!list_result.isOk()) {
        return Error(list_result.error().code(), list_result.error().what());
    }

    if (list_result.value().items.empty()) {
        return Error(ErrorCode::NotFound, "No matching record found");
    }

    return list_result.value().items[0];
}

Result<Json> RedisOperations::findByField(const std::string& entityName,
                                         const std::string& field,
                                         const Json& value) {
    Json filter;
    filter[field] = value;
    return findFirst(entityName, filter);
}

Result<Json> RedisOperations::upsert(const std::string& entityName,
                                     const std::string& uniqueField,
                                     const Json& uniqueValue,
                                     const Json& createData,
                                     const Json& updateData) {
    auto find_result = findByField(entityName, uniqueField, uniqueValue);

    if (find_result.isOk()) {
        const std::string id = find_result.value()["id"].get<std::string>();
        return adapter_.update(entityName, id, updateData);
    }

    return adapter_.create(entityName, createData);
}

// NOLINTNEXTLINE(bugprone-easily-swappable-parameters) - Parameter names are clear and order is logical
bool RedisOperations::matchesFilter(const Json& record, const Json& filter) {
    if (filter.is_null() || filter.empty()) {
        return true;
    }

    for (auto it = filter.begin(); it != filter.end(); ++it) {
        const std::string& key = it.key();
        const Json& expected_value = it.value();

        if (!record.contains(key) || record[key] != expected_value) {
            return false;
        }
    }

    return true;
}

} // namespace redis
} // namespace adapters
} // namespace dbal
