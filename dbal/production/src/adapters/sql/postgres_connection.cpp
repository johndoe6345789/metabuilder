#include "postgres_connection.hpp"
#include <libpq-fe.h>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace sql {

PostgresConnection::PostgresConnection(const SqlConnectionConfig& config)
    : config_(config) {}

PostgresConnection::~PostgresConnection() {
    disconnect();
}

bool PostgresConnection::connect() {
    if (conn_ && PQstatus(conn_) == CONNECTION_OK) {
        return true;
    }

    // Tear down stale handle before reconnecting
    disconnect();

    const std::string conninfo = buildConnInfo();
    conn_ = PQconnectdb(conninfo.c_str());

    if (PQstatus(conn_) != CONNECTION_OK) {
        spdlog::error("PostgreSQL connect failed: {}", PQerrorMessage(conn_));
        PQfinish(conn_);
        conn_ = nullptr;
        return false;
    }

    spdlog::info("PostgreSQL connected to {}:{}/{}",
                 config_.host, config_.port, config_.database);
    return true;
}

void PostgresConnection::disconnect() {
    if (conn_) {
        PQfinish(conn_);
        conn_ = nullptr;
    }
}

bool PostgresConnection::isAlive() const {
    return conn_ && PQstatus(conn_) == CONNECTION_OK;
}

std::string PostgresConnection::buildConnInfo() const {
    // libpq conninfo values must be single-quoted if they contain
    // spaces, quotes, or backslashes.  Inside quotes, escape ' and \.
    auto quote = [](const std::string& val) -> std::string {
        std::string out;
        out.reserve(val.size() + 2);
        out += '\'';
        for (char c : val) {
            if (c == '\'' || c == '\\') out += '\\';
            out += c;
        }
        out += '\'';
        return out;
    };

    std::string info;
    if (!config_.host.empty())     info += "host="     + quote(config_.host);
    if (config_.port > 0)          info += " port="    + std::to_string(config_.port);
    if (!config_.database.empty()) info += " dbname="  + quote(config_.database);
    if (!config_.user.empty())     info += " user="    + quote(config_.user);
    if (!config_.password.empty()) info += " password=" + quote(config_.password);
    if (!config_.options.empty())  info += " " + config_.options;
    return info;
}

}
}
}
