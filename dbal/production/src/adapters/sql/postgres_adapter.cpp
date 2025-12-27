#include "sql_adapter.hpp"

namespace dbal {
namespace adapters {
namespace sql {

PostgresAdapter::PostgresAdapter(const SqlConnectionConfig& config)
    : SqlAdapter(config, Dialect::Postgres) {}

}
}
}
