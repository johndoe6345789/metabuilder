#include "sql_adapter.hpp"

namespace dbal {
namespace adapters {
namespace sql {

MySQLAdapter::MySQLAdapter(const SqlConnectionConfig& config)
    : SqlAdapter(config, Dialect::MySQL) {}

}
}
}
