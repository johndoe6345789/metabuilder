#include "dbal/core/operation_executor.hpp"

namespace dbal {
namespace core {

OperationExecutor::OperationExecutor(adapters::Adapter* adapter)
    : adapter_(adapter)
{
}

// Template specializations will be added as needed
// For now, the executor serves as a placeholder for future adapter-based operations

} // namespace core
} // namespace dbal
