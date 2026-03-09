#include "mongodb_connection_manager.hpp"
#include <spdlog/spdlog.h>
#include <bsoncxx/builder/stream/document.hpp>

namespace dbal {
namespace adapters {
namespace mongodb {

using bsoncxx::builder::stream::document;
using bsoncxx::builder::stream::finalize;

MongoDBConnectionManager::MongoDBConnectionManager(const std::string& connection_string,
                                                   const std::string& database_name)
    : client_(mongocxx::uri{connection_string})
    , database_(client_[database_name])
    , database_name_(database_name) {

    spdlog::info("MongoDBConnectionManager: Connecting to {} database {}",
                connection_string, database_name);

    // Test connection
    if (!testConnection()) {
        throw std::runtime_error("Failed to connect to MongoDB server");
    }

    spdlog::info("MongoDBConnectionManager: Connected successfully");
}

mongocxx::client& MongoDBConnectionManager::getClient() {
    return client_;
}

mongocxx::database& MongoDBConnectionManager::getDatabase() {
    return database_;
}

const std::string& MongoDBConnectionManager::getDatabaseName() const {
    return database_name_;
}

bool MongoDBConnectionManager::testConnection() {
    try {
        // Ping the database to verify connection
        auto cmd = document{} << "ping" << 1 << finalize;
        auto result = database_.run_command(cmd.view());
        return true;
    } catch (const std::exception& e) {
        spdlog::error("MongoDBConnectionManager: Connection test failed: {}", e.what());
        return false;
    }
}

} // namespace mongodb
} // namespace adapters
} // namespace dbal
