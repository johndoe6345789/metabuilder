#ifndef DBAL_MYSQL_ERROR_MAPPER_HPP
#define DBAL_MYSQL_ERROR_MAPPER_HPP

#include "sql_types.hpp"

namespace dbal {
namespace adapters {
namespace sql {

/**
 * Maps a MySQL error number (from mysql_errno()) to the engine-neutral
 * SqlError::Code enum.
 */
inline SqlError::Code mapMySqlError(unsigned int errNo) {
    switch (errNo) {
        // Integrity constraint violations
        case 1062: return SqlError::Code::UniqueViolation;    // ER_DUP_ENTRY
        case 1586: return SqlError::Code::UniqueViolation;    // ER_DUP_ENTRY_WITH_KEY_NAME

        // Foreign key violations
        case 1451: return SqlError::Code::ForeignKeyViolation; // ER_ROW_IS_REFERENCED_2
        case 1452: return SqlError::Code::ForeignKeyViolation; // ER_NO_REFERENCED_ROW_2

        // Not found
        case 1146: return SqlError::Code::NotFound;            // ER_NO_SUCH_TABLE

        // Timeout
        case 1205: return SqlError::Code::Timeout;             // ER_LOCK_WAIT_TIMEOUT

        // Connection lost
        case 2006: return SqlError::Code::ConnectionLost;      // CR_SERVER_GONE_ERROR
        case 2013: return SqlError::Code::ConnectionLost;      // CR_SERVER_LOST

        default:   return SqlError::Code::Unknown;
    }
}

}
}
}

#endif
