#ifndef DBAL_SQL_TRANSACTION_MANAGER_HPP
#define DBAL_SQL_TRANSACTION_MANAGER_HPP

#include <string>
#include "sql_connection.hpp"

namespace dbal {
namespace adapters {
namespace sql {

/**
 * SQL Transaction Manager - Handles database transactions
 *
 * Provides RAII-style transaction management with automatic
 * rollback on exceptions and commit on success.
 */
class SqlTransactionManager {
public:
    explicit SqlTransactionManager(SqlConnection* connection);
    ~SqlTransactionManager();

    /**
     * Begin a transaction (START TRANSACTION)
     */
    void begin();

    /**
     * Commit the transaction (COMMIT)
     */
    void commit();

    /**
     * Rollback the transaction (ROLLBACK)
     */
    void rollback();

    /**
     * Check if transaction is active
     */
    bool isActive() const { return is_active_; }

private:
    SqlConnection* connection_;
    bool is_active_;
    bool committed_;
};

} // namespace sql
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQL_TRANSACTION_MANAGER_HPP
