#ifndef DBAL_MYSQL_CONNECTION_HPP
#define DBAL_MYSQL_CONNECTION_HPP

#include "sql_connection.hpp"
#include <string>

// Forward-declare MySQL handle to avoid leaking <mysql/mysql.h> into every TU.
struct MYSQL;

namespace dbal {
namespace adapters {
namespace sql {

/**
 * RAII wrapper around a libmysqlclient MYSQL* handle.
 *
 * Owns a single connection to MySQL. Thread-safety is the
 * caller's responsibility (the pool serialises access).
 */
class MySQLConnection {
public:
    explicit MySQLConnection(const SqlConnectionConfig& config);
    ~MySQLConnection();

    MySQLConnection(const MySQLConnection&) = delete;
    MySQLConnection& operator=(const MySQLConnection&) = delete;

    bool connect();
    void disconnect();
    bool isAlive() const;

    MYSQL* handle() const { return conn_; }

private:
    SqlConnectionConfig config_;
    MYSQL* conn_ = nullptr;
};

}
}
}

#endif
