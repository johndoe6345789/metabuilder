#ifndef DBAL_SQL_CONNECTION_HPP
#define DBAL_SQL_CONNECTION_HPP

#include <string>
#include <mutex>
#include <vector>
#include <atomic>
#include <chrono>
#include <memory>

namespace dbal {
namespace adapters {
namespace sql {

enum class Dialect {
    Postgres,
    MySQL,
    Prisma,
};

struct SqlConnectionConfig {
    std::string host;
    int port = 0;
    std::string database;
    std::string user;
    std::string password;
    std::string options;
    std::string prisma_bridge_url;
    std::string prisma_bridge_token;
    size_t max_connections = 10;
};

class SqlConnection {
public:
    explicit SqlConnection(const SqlConnectionConfig& config)
        : config_(config), connected_(false), lastActivity_(std::chrono::steady_clock::now()) {}

    ~SqlConnection() {
        disconnect();
    }

    bool connect() {
        std::lock_guard<std::mutex> lock(mu_);
        if (connected_) {
            return true;
        }

        // TODO: Integrate libpq (Postgres) or mysqlclient (MySQL) to open real sockets.
        connected_ = true;
        lastActivity_ = std::chrono::steady_clock::now();
        return connected_;
    }

    void disconnect() {
        std::lock_guard<std::mutex> lock(mu_);
        if (!connected_) {
            return;
        }
        // TODO: Close underlying native connection.
        connected_ = false;
    }

    bool isConnected() const {
        return connected_;
    }

    void touch() {
        lastActivity_ = std::chrono::steady_clock::now();
    }

    std::chrono::steady_clock::time_point lastActivity() const {
        return lastActivity_;
    }

private:
    SqlConnectionConfig config_;
    mutable std::mutex mu_;
    bool connected_;
    std::chrono::steady_clock::time_point lastActivity_;
};

class SqlPool {
public:
    SqlPool(const SqlConnectionConfig& config, size_t size = 5)
        : config_(config), size_(size) {
        for (size_t i = 0; i < size_; ++i) {
            auto conn = std::make_unique<SqlConnection>(config_);
            pool_.push_back(std::move(conn));
        }
    }

    SqlConnection* acquire() {
        std::lock_guard<std::mutex> lock(mu_);
        for (auto& conn : pool_) {
            if (conn && conn->connect()) {
                return conn.get();
            }
        }
        return nullptr;
    }

    void release(SqlConnection* connection) {
        if (!connection) {
            return;
        }
        std::lock_guard<std::mutex> lock(mu_);
        connection->touch();
    }

    size_t size() const {
        return size_;
    }

private:
    SqlConnectionConfig config_;
    size_t size_;
    std::vector<std::unique_ptr<SqlConnection>> pool_;
    mutable std::mutex mu_;
};

}
}
}

#endif
