#include "sqlite_transaction_manager.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace sqlite {

SQLiteTransactionManager::SQLiteTransactionManager(SQLiteConnectionManager& conn_manager)
    : conn_manager_(conn_manager) {
}

Result<bool> SQLiteTransactionManager::begin() {
    if (in_transaction_) {
        return Error::internal("Transaction already in progress");
    }

    auto result = executeTransactionStatement("BEGIN TRANSACTION");
    if (result.hasValue()) {
        in_transaction_ = true;
        spdlog::debug("Transaction started");
    }
    return result;
}

Result<bool> SQLiteTransactionManager::commit() {
    if (!in_transaction_) {
        return Error::internal("No transaction in progress");
    }

    auto result = executeTransactionStatement("COMMIT");
    if (result.hasValue()) {
        in_transaction_ = false;
        spdlog::debug("Transaction committed");
    }
    return result;
}

Result<bool> SQLiteTransactionManager::rollback() {
    if (!in_transaction_) {
        return Error::internal("No transaction in progress");
    }

    auto result = executeTransactionStatement("ROLLBACK");
    if (result.hasValue()) {
        in_transaction_ = false;
        spdlog::debug("Transaction rolled back");
    }
    return result;
}

Result<bool> SQLiteTransactionManager::savepoint(const std::string& name) {
    const std::string sql = "SAVEPOINT " + name;
    return executeTransactionStatement(sql);
}

Result<bool> SQLiteTransactionManager::releaseSavepoint(const std::string& name) {
    const std::string sql = "RELEASE SAVEPOINT " + name;
    return executeTransactionStatement(sql);
}

Result<bool> SQLiteTransactionManager::rollbackToSavepoint(const std::string& name) {
    const std::string sql = "ROLLBACK TO SAVEPOINT " + name;
    return executeTransactionStatement(sql);
}

Result<bool> SQLiteTransactionManager::executeTransactionStatement(const std::string& sql) {
    std::lock_guard<std::mutex> lock(conn_manager_.getMutex());

    char* error_msg = nullptr;
    const int rc = sqlite3_exec(conn_manager_.getHandle(), sql.c_str(),
                               nullptr, nullptr, &error_msg);

    if (rc != SQLITE_OK) {
        std::string error = "Transaction statement failed: ";
        if (error_msg) {
            error += error_msg;
            sqlite3_free(error_msg);
        }
        spdlog::error("{}: {}", error, sql);
        return Error::internal(error);
    }

    return Result<bool>(true);
}

// ===== Transaction Guard =====

SQLiteTransactionGuard::SQLiteTransactionGuard(SQLiteTransactionManager& tx_manager)
    : tx_manager_(tx_manager), committed_(false) {
    tx_manager_.begin();
}

SQLiteTransactionGuard::~SQLiteTransactionGuard() {
    if (!committed_ && tx_manager_.isInTransaction()) {
        spdlog::warn("Transaction guard destroyed without commit - rolling back");
        tx_manager_.rollback();
    }
}

Result<bool> SQLiteTransactionGuard::commit() {
    auto result = tx_manager_.commit();
    if (result.hasValue()) {
        committed_ = true;
    }
    return result;
}

} // namespace sqlite
} // namespace adapters
} // namespace dbal
