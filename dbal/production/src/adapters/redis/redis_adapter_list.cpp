#include "redis_adapter.hpp"
#include "redis_key_builder.hpp"
#include "redis_operations.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace redis {

Result<ListResult<Json>> RedisAdapter::list(const std::string& entityName, const ListOptions& options) {
    if (!schema_manager_.getSchema(entityName)) {
        return Error(ErrorCode::NotFound, "Entity schema not found: " + entityName);
    }

    const std::string set_key = RedisKeyBuilder::makeSetKey(entityName);
    auto members_result = command_executor_.smembers(set_key);

    if (!members_result.isOk()) {
        return Error(members_result.error().code(), members_result.error().what());
    }

    std::vector<Json> records;
    records.reserve(members_result.value().size());

    for (const auto& id : members_result.value()) {
        auto read_result = read(entityName, id);
        if (read_result.isOk()) {
            const Json record = read_result.value();
            if (options.filter.empty() || RedisOperations::matchesFilter(record, options.filter)) {
                records.push_back(record);
            }
        }
    }

    const int total = static_cast<int>(records.size());
    const int page = options.page;
    const int limit = options.limit > 0 ? options.limit : 100;
    const int offset = page * limit;

    std::vector<Json> paginated_records;
    if (offset < total) {
        const int end = std::min(offset + limit, total);
        paginated_records.assign(records.begin() + offset, records.begin() + end);
    }

    ListResult<Json> result;
    result.items = paginated_records;
    result.total = total;
    result.page = page;
    result.limit = limit;

    return result;
}

Result<int> RedisAdapter::createMany(const std::string& entityName, const std::vector<Json>& records) {
    return operations_.createMany(entityName, records);
}

Result<int> RedisAdapter::updateMany(const std::string& entityName, const Json& filter, const Json& data) {
    return operations_.updateMany(entityName, filter, data);
}

Result<int> RedisAdapter::deleteMany(const std::string& entityName, const Json& filter) {
    return operations_.deleteMany(entityName, filter);
}

Result<Json> RedisAdapter::findFirst(const std::string& entityName, const Json& filter) {
    return operations_.findFirst(entityName, filter);
}

Result<Json> RedisAdapter::findByField(const std::string& entityName, const std::string& field, const Json& value) {
    return operations_.findByField(entityName, field, value);
}

Result<Json> RedisAdapter::upsert(const std::string& entityName, const std::string& uniqueField,
                                  const Json& uniqueValue, const Json& createData, const Json& updateData) {
    return operations_.upsert(entityName, uniqueField, uniqueValue, createData, updateData);
}

} // namespace redis
} // namespace adapters
} // namespace dbal
