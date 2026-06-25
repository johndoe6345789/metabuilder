#include "cassandra_connection_manager.hpp"
#include <memory>
#include <spdlog/spdlog.h>
#include <stdexcept>

namespace dbal {
namespace adapters {
namespace cassandra {

namespace {
    struct CassFutureDeleter {
        void operator()(CassFuture* f) const { if (f) cass_future_free(f); }
    };
    struct CassStatementDeleter {
        void operator()(CassStatement* s) const { if (s) cass_statement_free(s); }
    };
    using UniqueCassFuture = std::unique_ptr<CassFuture, CassFutureDeleter>;
    using UniqueCassStatement = std::unique_ptr<CassStatement, CassStatementDeleter>;
} // anonymous namespace

CassandraConnectionManager::CassandraConnectionManager(const std::string& connection_url)
    : cluster_(nullptr),
      session_(nullptr),
      connection_url_(connection_url),
      host_("cassandra"),
      port_(9042),
      keyspace_("metabuilder"),
      connected_(false) {

    parseConnectionUrl(connection_url);
}

CassandraConnectionManager::~CassandraConnectionManager() {
    close();
}

void CassandraConnectionManager::parseConnectionUrl(const std::string& url) {
    // Parse cassandra://host:port/keyspace
    // For now, use defaults - full URL parsing would be more complex
    // TODO: Implement full URL parsing
    spdlog::debug("CassandraConnectionManager: Using connection URL: {}", url);
}

Result<bool> CassandraConnectionManager::connect() {
    std::lock_guard<std::mutex> lock(mutex_);
    spdlog::info("CassandraConnectionManager: Connecting to {}:{}", host_, port_);

    try {
        // Create cluster and session
        cluster_ = cass_cluster_new();
        session_ = cass_session_new();

        // Configure cluster
        cass_cluster_set_contact_points(cluster_, host_.c_str());
        cass_cluster_set_port(cluster_, port_);

        // Connect to cluster
        UniqueCassFuture connect_future(cass_session_connect(session_, cluster_));
        CassError rc = cass_future_error_code(connect_future.get());

        if (rc != CASS_OK) {
            std::string error_msg = std::string("Failed to connect: ") + cass_error_desc(rc);
            spdlog::error("CassandraConnectionManager: {}", error_msg);
            return Error(ErrorCode::DatabaseError, error_msg);
        }

        // Create keyspace if needed
        auto keyspace_result = createKeyspaceIfNotExists();
        if (!keyspace_result.isOk()) {
            return keyspace_result;
        }

        // Use the keyspace
        auto use_result = useKeyspace();
        if (!use_result.isOk()) {
            return use_result;
        }

        connected_ = true;
        spdlog::info("CassandraConnectionManager: Connected successfully to keyspace '{}'", keyspace_);
        return true;

    } catch (const std::exception& e) {
        spdlog::error("CassandraConnectionManager: Exception during connect: {}", e.what());
        // Note: close() also locks mutex_, so we must not call it while holding the lock.
        // Instead, inline the cleanup here.
        if (session_) {
            UniqueCassFuture close_future(cass_session_close(session_));
            cass_future_wait(close_future.get());
            cass_session_free(session_);
            session_ = nullptr;
        }
        if (cluster_) {
            cass_cluster_free(cluster_);
            cluster_ = nullptr;
        }
        connected_ = false;
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<bool> CassandraConnectionManager::createKeyspaceIfNotExists() {
    std::string create_cql =
        "CREATE KEYSPACE IF NOT EXISTS " + keyspace_ +
        " WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}";

    UniqueCassStatement statement(cass_statement_new(create_cql.c_str(), 0));
    UniqueCassFuture query_future(cass_session_execute(session_, statement.get()));
    CassError rc = cass_future_error_code(query_future.get());

    if (rc != CASS_OK) {
        std::string error_msg = std::string("Failed to create keyspace: ") + cass_error_desc(rc);
        spdlog::warn("CassandraConnectionManager: {}", error_msg);
        // Don't fail - keyspace might already exist
    }

    return true;
}

Result<bool> CassandraConnectionManager::useKeyspace() {
    std::string use_cql = "USE " + keyspace_;

    UniqueCassStatement statement(cass_statement_new(use_cql.c_str(), 0));
    UniqueCassFuture query_future(cass_session_execute(session_, statement.get()));
    CassError rc = cass_future_error_code(query_future.get());

    if (rc != CASS_OK) {
        std::string error_msg = std::string("Failed to use keyspace: ") + cass_error_desc(rc);
        spdlog::error("CassandraConnectionManager: {}", error_msg);
        return Error(ErrorCode::InternalError, error_msg);
    }

    return true;
}

void CassandraConnectionManager::close() {
    std::lock_guard<std::mutex> lock(mutex_);
    if (session_) {
        UniqueCassFuture close_future(cass_session_close(session_));
        cass_future_wait(close_future.get());
        cass_session_free(session_);
        session_ = nullptr;
    }

    if (cluster_) {
        cass_cluster_free(cluster_);
        cluster_ = nullptr;
    }

    connected_ = false;
    spdlog::info("CassandraConnectionManager: Connection closed");
}

CassSession* CassandraConnectionManager::getSession() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return session_;
}

const std::string& CassandraConnectionManager::getKeyspace() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return keyspace_;
}

bool CassandraConnectionManager::isConnected() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return connected_;
}

} // namespace cassandra
} // namespace adapters
} // namespace dbal
