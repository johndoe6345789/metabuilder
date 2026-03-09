#include "mysql_connection.hpp"
#include <mysql/mysql.h>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace sql {

MySQLConnection::MySQLConnection(const SqlConnectionConfig& config)
    : config_(config) {}

MySQLConnection::~MySQLConnection() {
    disconnect();
}

bool MySQLConnection::connect() {
    if (conn_ && mysql_ping(conn_) == 0) {
        return true;
    }

    // Tear down stale handle before reconnecting
    disconnect();

    conn_ = mysql_init(nullptr);
    if (!conn_) {
        spdlog::error("MySQL mysql_init() failed");
        return false;
    }

    // Set connection options
    unsigned int timeout = 10;
    mysql_options(conn_, MYSQL_OPT_CONNECT_TIMEOUT, &timeout);

    const char* charset = "utf8mb4";
    mysql_options(conn_, MYSQL_SET_CHARSET_NAME, charset);

    unsigned int port = config_.port > 0 ? static_cast<unsigned int>(config_.port) : 3306;

    MYSQL* result = mysql_real_connect(
        conn_,
        config_.host.empty() ? "127.0.0.1" : config_.host.c_str(),
        config_.user.empty() ? nullptr : config_.user.c_str(),
        config_.password.empty() ? nullptr : config_.password.c_str(),
        config_.database.empty() ? nullptr : config_.database.c_str(),
        port,
        nullptr,  // unix_socket
        0         // client_flag
    );

    if (!result) {
        spdlog::error("MySQL connect failed: {}", mysql_error(conn_));
        mysql_close(conn_);
        conn_ = nullptr;
        return false;
    }

    spdlog::info("MySQL connected to {}:{}/{}",
                 config_.host, port, config_.database);
    return true;
}

void MySQLConnection::disconnect() {
    if (conn_) {
        mysql_close(conn_);
        conn_ = nullptr;
    }
}

bool MySQLConnection::isAlive() const {
    return conn_ && mysql_ping(const_cast<MYSQL*>(conn_)) == 0;
}

}
}
}
