#include "mongodb_adapter.hpp"
#include "mongodb_query_builder.hpp"
#include "mongodb_type_converter.hpp"
#include "mongodb_result_parser.hpp"
#include "mongodb_bulk_operations.hpp"
#include <spdlog/spdlog.h>
#include <bsoncxx/exception/exception.hpp>
#include <mongocxx/options/find.hpp>
#include <mongocxx/options/find_one_and_update.hpp>

namespace dbal {
namespace adapters {
namespace mongodb {

MongoDBAdapter::MongoDBAdapter(const MongoDBConfig& config)
    : connection_(std::make_unique<MongoDBConnectionManager>(config.connectionString, config.database))
    , collections_(std::make_unique<MongoDBCollectionManager>(connection_->getDatabase())) {

    spdlog::info("MongoDBAdapter initialized with {} entity schemas",
                collections_->getSchemaCount());
}

// ===== Transaction Support =====

Result<bool> MongoDBAdapter::beginTransaction() {
    if (compensating_tx_ && compensating_tx_->isActive()) {
        return Error::internal("Transaction already in progress");
    }
    compensating_tx_ = std::make_unique<dbal::core::CompensatingTransaction>(*this);
    return Result<bool>(true);
}

Result<bool> MongoDBAdapter::commitTransaction() {
    if (!compensating_tx_ || !compensating_tx_->isActive()) {
        return Error::internal("No transaction in progress");
    }
    compensating_tx_->commit();
    compensating_tx_.reset();
    return Result<bool>(true);
}

Result<bool> MongoDBAdapter::rollbackTransaction() {
    if (!compensating_tx_ || !compensating_tx_->isActive()) {
        return Error::internal("No transaction in progress");
    }
    auto result = compensating_tx_->rollback();
    compensating_tx_.reset();
    return result;
}

// ===== CRUD Operations =====

Result<Json> MongoDBAdapter::create(const std::string& entityName, const Json& data) {
    try {
        auto collection = collections_->getCollection(entityName);
        auto bsonDoc = MongoDBTypeConverter::jsonToBson(data);
        auto result = collection.insert_one(bsonDoc.view());

        if (!result) {
            return Error::internal("MongoDB insert operation failed");
        }

        Json created = MongoDBResultParser::parseInsertResult(*result, data);

        // Record operation for compensating transaction
        if (compensating_tx_ && compensating_tx_->isActive()) {
            std::string id = created.contains("id") ? created["id"].get<std::string>() : "";
            compensating_tx_->recordCreate(entityName, id);
        }

        return Result<Json>(created);

    } catch (const bsoncxx::exception& e) {
        spdlog::error("MongoDB create error: {}", e.what());
        return Error::internal(std::string("MongoDB error: ") + e.what());
    } catch (const std::exception& e) {
        spdlog::error("Unexpected error in create: {}", e.what());
        return Error::internal(e.what());
    }
}

Result<Json> MongoDBAdapter::read(const std::string& entityName, const std::string& id) {
    try {
        auto collection = collections_->getCollection(entityName);
        auto filter = MongoDBTypeConverter::buildIdFilter(id);
        auto result = collection.find_one(filter.view());

        if (!result) {
            return Error::notFound("Document not found with id: " + id);
        }

        return Result<Json>(MongoDBTypeConverter::bsonToJson(result->view()));

    } catch (const bsoncxx::exception& e) {
        spdlog::error("MongoDB read error: {}", e.what());
        return Error::internal(std::string("MongoDB error: ") + e.what());
    } catch (const Error& e) {
        return e;
    } catch (const std::exception& e) {
        spdlog::error("Unexpected error in read: {}", e.what());
        return Error::internal(e.what());
    }
}

Result<Json> MongoDBAdapter::update(const std::string& entityName, const std::string& id, const Json& data) {
    try {
        // Snapshot old data for compensating transaction before update
        if (compensating_tx_ && compensating_tx_->isActive()) {
            auto oldData = read(entityName, id);
            if (oldData.isOk()) {
                compensating_tx_->recordUpdate(entityName, id, oldData.value());
            }
        }

        auto collection = collections_->getCollection(entityName);
        auto filter = MongoDBTypeConverter::buildIdFilter(id);
        auto updateDoc = MongoDBQueryBuilder::buildUpdate(data);

        mongocxx::options::find_one_and_update options;
        options.return_document(mongocxx::options::return_document::k_after);

        auto result = collection.find_one_and_update(filter.view(), updateDoc.view(), options);

        if (!result) {
            return Error::notFound("Document not found with id: " + id);
        }

        return Result<Json>(MongoDBTypeConverter::bsonToJson(result->view()));

    } catch (const bsoncxx::exception& e) {
        spdlog::error("MongoDB update error: {}", e.what());
        return Error::internal(std::string("MongoDB error: ") + e.what());
    } catch (const Error& e) {
        return e;
    } catch (const std::exception& e) {
        spdlog::error("Unexpected error in update: {}", e.what());
        return Error::internal(e.what());
    }
}

Result<bool> MongoDBAdapter::remove(const std::string& entityName, const std::string& id) {
    try {
        // Snapshot old data for compensating transaction before delete
        if (compensating_tx_ && compensating_tx_->isActive()) {
            auto oldData = read(entityName, id);
            if (oldData.isOk()) {
                compensating_tx_->recordDelete(entityName, oldData.value());
            }
        }

        auto collection = collections_->getCollection(entityName);
        auto filter = MongoDBTypeConverter::buildIdFilter(id);
        auto result = collection.delete_one(filter.view());

        if (!result) {
            return Error::internal("MongoDB delete operation failed");
        }

        if (result->deleted_count() == 0) {
            return Error::notFound("Document not found with id: " + id);
        }

        return Result<bool>(true);

    } catch (const bsoncxx::exception& e) {
        spdlog::error("MongoDB remove error: {}", e.what());
        return Error::internal(std::string("MongoDB error: ") + e.what());
    } catch (const Error& e) {
        return e;
    } catch (const std::exception& e) {
        spdlog::error("Unexpected error in remove: {}", e.what());
        return Error::internal(e.what());
    }
}

Result<ListResult<Json>> MongoDBAdapter::list(const std::string& entityName, const ListOptions& options) {
    try {
        auto collection = collections_->getCollection(entityName);
        auto filterDoc = MongoDBQueryBuilder::buildFilter(options.filter);

        mongocxx::options::find findOptions;

        const int limit = options.limit > 0 ? options.limit : 50;
        const int skip = MongoDBQueryBuilder::calculateSkip(options.page, limit);
        findOptions.limit(limit);
        findOptions.skip(skip);

        if (!options.sort.empty()) {
            findOptions.sort(MongoDBQueryBuilder::buildSort(options.sort).view());
        }

        auto cursor = collection.find(filterDoc.view(), findOptions);
        int total = static_cast<int>(collection.count_documents(filterDoc.view()));

        return Result<ListResult<Json>>(
            MongoDBResultParser::buildListResult(cursor, total, options.page, limit));

    } catch (const bsoncxx::exception& e) {
        spdlog::error("MongoDB list error: {}", e.what());
        return Error::internal(std::string("MongoDB error: ") + e.what());
    } catch (const std::exception& e) {
        spdlog::error("Unexpected error in list: {}", e.what());
        return Error::internal(e.what());
    }
}

// ===== Bulk Operations =====

Result<int> MongoDBAdapter::createMany(const std::string& entityName, const std::vector<Json>& records) {
    if (!collections_) {
        return Error::internal("MongoDB collections not initialized");
    }
    auto collection = collections_->getCollection(entityName);
    return MongoDBBulkOperations::insertMany(collection, records);
}

Result<int> MongoDBAdapter::updateMany(const std::string& entityName, const Json& filter, const Json& data) {
    if (!collections_) {
        return Error::internal("MongoDB collections not initialized");
    }
    auto collection = collections_->getCollection(entityName);
    return MongoDBBulkOperations::updateMany(collection, filter, data);
}

Result<int> MongoDBAdapter::deleteMany(const std::string& entityName, const Json& filter) {
    if (!collections_) {
        return Error::internal("MongoDB collections not initialized");
    }
    auto collection = collections_->getCollection(entityName);
    return MongoDBBulkOperations::deleteMany(collection, filter);
}

// ===== Query Operations =====

Result<Json> MongoDBAdapter::findFirst(const std::string& entityName, const Json& filter) {
    try {
        auto collection = collections_->getCollection(entityName);
        auto filterDoc = MongoDBQueryBuilder::buildFilter(filter);
        auto result = collection.find_one(filterDoc.view());

        if (!result) {
            return Error::notFound("No document found matching filter");
        }

        return Result<Json>(MongoDBTypeConverter::bsonToJson(result->view()));

    } catch (const bsoncxx::exception& e) {
        spdlog::error("MongoDB findFirst error: {}", e.what());
        return Error::internal(std::string("MongoDB error: ") + e.what());
    } catch (const std::exception& e) {
        spdlog::error("Unexpected error in findFirst: {}", e.what());
        return Error::internal(e.what());
    }
}

Result<Json> MongoDBAdapter::findByField(const std::string& entityName, const std::string& field, const Json& value) {
    Json filter = {{field, value}};
    return findFirst(entityName, filter);
}

Result<Json> MongoDBAdapter::upsert(const std::string& entityName, const std::string& uniqueField,
                                    const Json& uniqueValue, const Json& createData, const Json& updateData) {
    try {
        auto collection = collections_->getCollection(entityName);

        Json filterJson = {{uniqueField, uniqueValue}};
        auto filterDoc = MongoDBQueryBuilder::buildFilter(filterJson);
        auto updateDoc = MongoDBQueryBuilder::buildUpsertUpdate(updateData, createData);

        mongocxx::options::find_one_and_update options;
        options.upsert(true);
        options.return_document(mongocxx::options::return_document::k_after);

        auto result = collection.find_one_and_update(filterDoc.view(), updateDoc.view(), options);

        if (!result) {
            return Error::internal("MongoDB upsert operation failed");
        }

        return Result<Json>(MongoDBTypeConverter::bsonToJson(result->view()));

    } catch (const bsoncxx::exception& e) {
        spdlog::error("MongoDB upsert error: {}", e.what());
        return Error::internal(std::string("MongoDB error: ") + e.what());
    } catch (const std::exception& e) {
        spdlog::error("Unexpected error in upsert: {}", e.what());
        return Error::internal(e.what());
    }
}

// ===== Metadata =====

Result<std::vector<std::string>> MongoDBAdapter::getAvailableEntities() {
    return Result<std::vector<std::string>>(collections_->getAvailableEntities());
}

Result<EntitySchema> MongoDBAdapter::getEntitySchema(const std::string& entityName) {
    auto schema = collections_->getEntitySchema(entityName);
    if (!schema) {
        return Error::notFound("Schema not found for entity: " + entityName);
    }
    return Result<EntitySchema>(*schema);
}

void MongoDBAdapter::close() {
    spdlog::info("MongoDBAdapter connection closed");
}

} // namespace mongodb
} // namespace adapters
} // namespace dbal
