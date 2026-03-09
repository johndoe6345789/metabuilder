#ifndef DBAL_SQLITE_TRANSACTION_MANAGER_HPP
#define DBAL_SQLITE_TRANSACTION_MANAGER_HPP

#include <atomic>
#include <string>
#include "dbal/errors.hpp"
#include "sqlite_connection_manager.hpp"

namespace dbal {
namespace adapters {
namespace sqlite {

/**
 * Transaction Manager - Handles SQLite transaction lifecycle
 *
 * Provides transaction control (BEGIN, COMMIT, ROLLBACK)
 * Supports nested transactions via savepoints
 * RAII-style transaction guard for automatic rollback
 */
class SQLiteTransactionManager {
public:
    explicit SQLiteTransactionManager(SQLiteConnectionManager& conn_manager);
    ~SQLiteTransactionManager() = default;

    /**
     * Begin a new transaction
     */
    Result<bool> begin();

    /**
     * Commit the current transaction
     */
    Result<bool> commit();

    /**
     * Rollback the current transaction
     */
    Result<bool> rollback();

    /**
     * Create a savepoint (nested transaction)
     */
    Result<bool> savepoint(const std::string& name);

    /**
     * Release a savepoint
     */
    Result<bool> releaseSavepoint(const std::string& name);

    /**
     * Rollback to a savepoint
     */
    Result<bool> rollbackToSavepoint(const std::string& name);

    /**
     * Check if currently in a transaction
     */
    bool isInTransaction() const { return in_transaction_; }

private:
    /**
     * Execute a transaction control statement
     */
    Result<bool> executeTransactionStatement(const std::string& sql);

    SQLiteConnectionManager& conn_manager_;
    std::atomic<bool> in_transaction_{false};
};

/**
 * RAII Transaction Guard - Automatic rollback on scope exit
 *
 * Usage:
 *   {
 *     SQLiteTransactionGuard guard(tx_manager);
 *     // ... do work ...
 *     guard.commit(); // Explicitly commit
 *   } // Auto-rollback if commit() not called
 */
class SQLiteTransactionGuard {
public:
    explicit SQLiteTransactionGuard(SQLiteTransactionManager& tx_manager);
    ~SQLiteTransactionGuard();

    // Non-copyable, non-movable
    SQLiteTransactionGuard(const SQLiteTransactionGuard&) = delete;
    SQLiteTransactionGuard& operator=(const SQLiteTransactionGuard&) = delete;

    /**
     * Commit the transaction (prevents auto-rollback)
     */
    Result<bool> commit();

private:
    SQLiteTransactionManager& tx_manager_;
    bool committed_;
};

} // namespace sqlite
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQLITE_TRANSACTION_MANAGER_HPP
