#ifndef DBAL_POSTGRES_ERROR_MAPPER_HPP
#define DBAL_POSTGRES_ERROR_MAPPER_HPP

#include "sql_types.hpp"
#include <cstring>

namespace dbal {
namespace adapters {
namespace sql {

/**
 * Maps a PostgreSQL SQLSTATE (5-char code from PQresultErrorField)
 * to the engine-neutral SqlError::Code enum.
 */
inline SqlError::Code mapPgSqlState(const char* state) {
    if (!state) return SqlError::Code::Unknown;

    // Class 23 — Integrity constraint violation
    if (std::strcmp(state, "23505") == 0) return SqlError::Code::UniqueViolation;
    if (std::strcmp(state, "23503") == 0) return SqlError::Code::ForeignKeyViolation;

    // Class 42 — Syntax / access rule
    if (std::strcmp(state, "42P01") == 0) return SqlError::Code::NotFound;  // undefined_table

    // Class 57 — Operator intervention
    if (std::strcmp(state, "57014") == 0) return SqlError::Code::Timeout;   // query_canceled

    // Class 08 — Connection exception
    if (state[0] == '0' && state[1] == '8')  return SqlError::Code::ConnectionLost;

    return SqlError::Code::Unknown;
}

}
}
}

#endif
