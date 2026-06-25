#ifndef DBAL_CORE_OPERATION_EXECUTOR_HPP
#define DBAL_CORE_OPERATION_EXECUTOR_HPP

#include <memory>
#include <vector>
#include <map>
#include <optional>
#include "adapters/adapter.hpp"
#include "types.hpp"
#include "errors.hpp"

namespace dbal {
namespace core {

/**
 * Executor for CRUD operations across all entity types.
 *
 * Provides a unified interface for executing database operations
 * through adapters. Handles:
 * - Basic CRUD (create, read, update, delete)
 * - Batch operations (createMany, updateMany, deleteMany)
 * - Query operations (list, search, count)
 * - Specialized operations (findFirst, findByField, upsert)
 */
class OperationExecutor {
public:
    /**
     * Construct executor with adapter.
     *
     * @param adapter Database adapter instance
     */
    explicit OperationExecutor(adapters::Adapter* adapter);

    /**
     * Execute entity-specific create operation.
     *
     * Delegates to entity-specific implementation for now.
     * Will be refactored to use adapter directly.
     */
    template<typename EntityType, typename InputType>
    Result<EntityType> executeCreate(
        const std::string& entity_name,
        const InputType& input
    );

    /**
     * Execute entity-specific read operation.
     */
    template<typename EntityType>
    Result<EntityType> executeRead(
        const std::string& entity_name,
        const std::string& id
    );

    /**
     * Execute entity-specific update operation.
     */
    template<typename EntityType, typename InputType>
    Result<EntityType> executeUpdate(
        const std::string& entity_name,
        const std::string& id,
        const InputType& input
    );

    /**
     * Execute entity-specific delete operation.
     */
    Result<bool> executeDelete(
        const std::string& entity_name,
        const std::string& id
    );

    /**
     * Execute entity-specific list operation.
     */
    template<typename EntityType>
    Result<std::vector<EntityType>> executeList(
        const std::string& entity_name,
        const ListOptions& options
    );

    /**
     * Check if executor has a valid adapter.
     */
    bool hasAdapter() const { return adapter_ != nullptr; }

private:
    adapters::Adapter* adapter_;
};

} // namespace core
} // namespace dbal

#endif // DBAL_CORE_OPERATION_EXECUTOR_HPP
