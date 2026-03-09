#ifndef DBAL_SQL_TYPES_HPP
#define DBAL_SQL_TYPES_HPP

#include <string>
#include <map>

namespace dbal {
namespace adapters {
namespace sql {

/**
 * SQL parameter binding
 */
struct SqlParam {
    std::string name;
    std::string value;
};

/**
 * SQL result row
 */
struct SqlRow {
    std::map<std::string, std::string> columns;
};

/**
 * SQL error codes
 */
struct SqlError {
    enum class Code {
        UniqueViolation,
        ForeignKeyViolation,
        NotFound,
        Timeout,
        ConnectionLost,
        Unknown
    };

    Code code;
    std::string message;
};

// Dialect is defined in sql_connection.hpp

}
}
}

#endif
