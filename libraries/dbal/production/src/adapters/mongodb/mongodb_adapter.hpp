#ifndef DBAL_MONGODB_ADAPTER_HPP
#define DBAL_MONGODB_ADAPTER_HPP

#include <memory>
#include <string>
#include "dbal/adapters/adapter.hpp"
#include "dbal/core/compensating_transaction.hpp"
#include "mongodb_connection_manager.hpp"
#include "mongodb_collection_manager.hpp"

namespace dbal {
namespace adapters {
namespace mongodb {

/**
 * @struct MongoDBConfig
 * @brief Configuration for MongoDB connection
 */
struct MongoDBConfig {
    std::string connectionString;  ///< mongodb://localhost:27017
    std::string database;          ///< Database name
    int timeout = 30000;           ///< Connection timeout in milliseconds
};

/**
 * @class MongoDBAdapter
 * @brief Generic MongoDB adapter implementing DBAL interface
 *
 * Provides NoSQL document-based storage using MongoDB C++ driver.
 * Delegates operations to specialized helper classes:
 * - MongoDBConnectionManager: Connection handling
 * - MongoDBCollectionManager: Schema and collection management
 * - MongoDBQueryBuilder: BSON query construction
 * - MongoDBTypeConverter: JSON ↔ BSON conversion
 * - MongoDBResultParser: Result parsing
 * - MongoDBBulkOperations: Bulk operations
 *
 * @example
 * @code
 * MongoDBConfig config{
 *     "mongodb://localhost:27017",
 *     "metabuilder",
 *     30000
 * };
 * MongoDBAdapter adapter(config);
 *
 * // Create user
 * Json userData = {{"username", "john"}, {"email", "john@example.com"}};
 * auto result = adapter.create("users", userData);
 * @endcode
 */
class MongoDBAdapter : public Adapter {
public:
    /**
     * @brief Construct MongoDB adapter with configuration
     * @param config MongoDB connection configuration
     * @throws std::runtime_error if connection fails or schemas cannot be loaded
     */
    explicit MongoDBAdapter(const MongoDBConfig& config);

    ~MongoDBAdapter() override = default;

    // ===== Transaction Support (Compensating) =====

    bool supportsNativeTransactions() const override { return false; }
    Result<bool> beginTransaction() override;
    Result<bool> commitTransaction() override;
    Result<bool> rollbackTransaction() override;

    // ===== Generic CRUD Operations =====

    Result<Json> create(const std::string& entityName, const Json& data) override;
    Result<Json> read(const std::string& entityName, const std::string& id) override;
    Result<Json> update(const std::string& entityName, const std::string& id, const Json& data) override;
    Result<bool> remove(const std::string& entityName, const std::string& id) override;
    Result<ListResult<Json>> list(const std::string& entityName, const ListOptions& options) override;

    // ===== Bulk Operations =====

    Result<int> createMany(const std::string& entityName, const std::vector<Json>& records) override;
    Result<int> updateMany(const std::string& entityName, const Json& filter, const Json& data) override;
    Result<int> deleteMany(const std::string& entityName, const Json& filter) override;

    // ===== Query Operations =====

    Result<Json> findFirst(const std::string& entityName, const Json& filter) override;
    Result<Json> findByField(const std::string& entityName, const std::string& field, const Json& value) override;
    Result<Json> upsert(const std::string& entityName, const std::string& uniqueField, const Json& uniqueValue, const Json& createData, const Json& updateData) override;

    // ===== Metadata =====

    Result<std::vector<std::string>> getAvailableEntities() override;
    Result<EntitySchema> getEntitySchema(const std::string& entityName) override;

    void close() override;

private:
    std::unique_ptr<MongoDBConnectionManager> connection_;
    std::unique_ptr<MongoDBCollectionManager> collections_;
    std::unique_ptr<dbal::core::CompensatingTransaction> compensating_tx_;
};

} // namespace mongodb
} // namespace adapters
} // namespace dbal

#endif // DBAL_MONGODB_ADAPTER_HPP
