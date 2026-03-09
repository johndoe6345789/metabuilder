#include "sql_transaction_manager.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace sql {

SqlTransactionManager::SqlTransactionManager(SqlConnection* connection)
    : connection_(connection), is_active_(false), committed_(false) {
}

SqlTransactionManager::~SqlTransactionManager() {
    // Auto-rollback if transaction is active and not committed
    if (is_active_ && !committed_) {
        try {
            rollback();
        } catch (const std::exception& e) {
            spdlog::error("SqlTransactionManager: Failed to rollback transaction: {}", e.what());
        }
    }
}

void SqlTransactionManager::begin() {
    if (is_active_) {
        throw std::runtime_error("Transaction already active");
    }

    // Execute BEGIN TRANSACTION
    // Note: Actual SQL execution would be done via connection
    // This is a simplified implementation
    spdlog::debug("SqlTransactionManager: BEGIN TRANSACTION");
    is_active_ = true;
}

void SqlTransactionManager::commit() {
    if (!is_active_) {
        throw std::runtime_error("No active transaction to commit");
    }

    // Execute COMMIT
    spdlog::debug("SqlTransactionManager: COMMIT");
    committed_ = true;
    is_active_ = false;
}

void SqlTransactionManager::rollback() {
    if (!is_active_) {
        throw std::runtime_error("No active transaction to rollback");
    }

    // Execute ROLLBACK
    spdlog::debug("SqlTransactionManager: ROLLBACK");
    is_active_ = false;
}

} // namespace sql
} // namespace adapters
} // namespace dbal
