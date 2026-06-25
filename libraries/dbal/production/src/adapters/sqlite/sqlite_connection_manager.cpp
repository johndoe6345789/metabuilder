#include "sqlite_connection_manager.hpp"
#include <stdexcept>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace sqlite {

SQLiteConnectionManager::SQLiteConnectionManager(const std::string& db_path)
    : db_path_(db_path), db_(nullptr) {
    openConnection();
    configurePragmas();
}

SQLiteConnectionManager::~SQLiteConnectionManager() {
    close();
}

void SQLiteConnectionManager::openConnection() {
    const int rc = sqlite3_open(db_path_.c_str(), &db_);
    if (rc != SQLITE_OK) {
        std::string error_msg = "Failed to open SQLite database: ";
        if (db_) {
            error_msg += sqlite3_errmsg(db_);
            sqlite3_close(db_);
            db_ = nullptr;
        } else {
            error_msg += "out of memory";
        }
        throw std::runtime_error(error_msg);
    }
    spdlog::info("SQLite connection opened: {}", db_path_);
}

void SQLiteConnectionManager::configurePragmas() {
    // Enable foreign keys for referential integrity
    auto fk_result = executePragma("PRAGMA foreign_keys = ON");
    if (!fk_result.hasValue()) {
        spdlog::warn("Failed to set foreign_keys pragma: {}", fk_result.error().what());
    }

    // Enable Write-Ahead Logging for better concurrency
    auto wal_result = executePragma("PRAGMA journal_mode = WAL");
    if (!wal_result.hasValue()) {
        spdlog::warn("Failed to set journal_mode pragma: {}", wal_result.error().what());
    }

    // Set synchronous mode to NORMAL for better performance
    auto sync_result = executePragma("PRAGMA synchronous = NORMAL");
    if (!sync_result.hasValue()) {
        spdlog::warn("Failed to set synchronous pragma: {}", sync_result.error().what());
    }

    // Set temp_store to memory for faster operations
    auto temp_result = executePragma("PRAGMA temp_store = MEMORY");
    if (!temp_result.hasValue()) {
        spdlog::warn("Failed to set temp_store pragma: {}", temp_result.error().what());
    }
}

void SQLiteConnectionManager::close() {
    std::lock_guard<std::mutex> lock(mutex_);
    if (db_) {
        sqlite3_close(db_);
        db_ = nullptr;
        spdlog::info("SQLite connection closed: {}", db_path_);
    }
}

int64_t SQLiteConnectionManager::getLastInsertRowId() const {
    if (!db_) {
        return -1;
    }
    return sqlite3_last_insert_rowid(db_);
}

int SQLiteConnectionManager::getChanges() const {
    if (!db_) {
        return 0;
    }
    return sqlite3_changes(db_);
}

Result<bool> SQLiteConnectionManager::executePragma(const std::string& pragma) {
    if (!db_) {
        return Error::internal("Database not open");
    }

    char* error_msg = nullptr;
    const int rc = sqlite3_exec(db_, pragma.c_str(), nullptr, nullptr, &error_msg);

    if (rc != SQLITE_OK) {
        std::string error = "Failed to execute pragma: ";
        if (error_msg) {
            error += error_msg;
            sqlite3_free(error_msg);
        }
        spdlog::warn("{}: {}", error, pragma);
        return Error::internal(error);
    }

    return Result<bool>(true);
}

} // namespace sqlite
} // namespace adapters
} // namespace dbal
