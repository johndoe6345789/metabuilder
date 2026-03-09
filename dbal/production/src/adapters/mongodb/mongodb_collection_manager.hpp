#ifndef DBAL_MONGODB_COLLECTION_MANAGER_HPP
#define DBAL_MONGODB_COLLECTION_MANAGER_HPP

#include <mongocxx/collection.hpp>
#include <mongocxx/database.hpp>
#include <mongocxx/options/index.hpp>
#include <string>
#include <unordered_map>
#include "dbal/adapters/adapter.hpp"
#include "../schema_loader.hpp"

namespace dbal {
namespace adapters {
namespace mongodb {

using dbal::adapters::EntitySchema;

/**
 * MongoDB Collection Manager - Manages database collections and entity schemas
 *
 * Responsibilities:
 * - Load entity schemas from YAML
 * - Provide collection handles for entity operations
 * - Cache collection references
 * - Metadata queries (available entities, schemas)
 */
class MongoDBCollectionManager {
public:
    /**
     * Constructor - Initializes with database handle and schema path
     * @param database Reference to MongoDB database
     * @param schema_path Path to YAML schema directory
     */
    explicit MongoDBCollectionManager(mongocxx::database& database,
                                     const std::string& schema_path = "dbal/shared/api/schema/entities/");

    /**
     * Get collection handle for entity
     * @param entityName Entity/collection name
     * @return MongoDB collection handle
     */
    mongocxx::collection getCollection(const std::string& entityName);

    /**
     * Get list of available entity names from loaded schemas
     * @return Vector of entity names
     */
    std::vector<std::string> getAvailableEntities() const;

    /**
     * Get entity schema by name
     * @param entityName Entity name
     * @return EntitySchema if found, std::nullopt otherwise
     */
    std::optional<EntitySchema> getEntitySchema(const std::string& entityName) const;

    /**
     * Get count of loaded schemas
     * @return Number of schemas
     */
    size_t getSchemaCount() const;

private:
    void loadSchemas(const std::string& schema_path);
    void ensureIndexes(const EntityDefinition& entity, mongocxx::collection& coll);

    mongocxx::database& database_;
    std::map<std::string, EntitySchema> schemas_;
};

} // namespace mongodb
} // namespace adapters
} // namespace dbal

#endif // DBAL_MONGODB_COLLECTION_MANAGER_HPP
