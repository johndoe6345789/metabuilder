#ifndef DBAL_POSTGRES_CONNECTION_HPP
#define DBAL_POSTGRES_CONNECTION_HPP

#include "sql_connection.hpp"
#include <string>

// Forward-declare libpq handle to avoid leaking <libpq-fe.h> into every TU.
extern "C" { typedef struct pg_conn PGconn; }

namespace dbal {
namespace adapters {
namespace sql {

/**
 * RAII wrapper around a libpq PGconn* handle.
 *
 * Owns a single connection to PostgreSQL. Thread-safety is the
 * caller's responsibility (the pool serialises access).
 */
class PostgresConnection {
public:
    explicit PostgresConnection(const SqlConnectionConfig& config);
    ~PostgresConnection();

    PostgresConnection(const PostgresConnection&) = delete;
    PostgresConnection& operator=(const PostgresConnection&) = delete;

    bool connect();
    void disconnect();
    bool isAlive() const;

    PGconn* handle() const { return conn_; }

private:
    std::string buildConnInfo() const;

    SqlConnectionConfig config_;
    PGconn* conn_ = nullptr;
};

}
}
}

#endif
