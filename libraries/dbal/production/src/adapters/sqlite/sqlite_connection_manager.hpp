#ifndef DBAL_SQLITE_CONNECTION_MANAGER_HPP
#define DBAL_SQLITE_CONNECTION_MANAGER_HPP

#include <sqlite3.h>
#include <string>
#include <mutex>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace sqlite {

/**
 * Connection Manager - Manages SQLite database connection lifecycle
 *
 * Handles opening, closing, and configuration of SQLite connections
 * Provides thread-safe access to the database handle
 * Manages pragmas and connection settings
 */
class SQLiteConnectionManager {
public:
    explicit SQLiteConnectionManager(const std::string& db_path);
    ~SQLiteConnectionManager();

    // Non-copyable, non-movable
    SQLiteConnectionManager(const SQLiteConnectionManager&) = delete;
    SQLiteConnectionManager& operator=(const SQLiteConnectionManager&) = delete;

    /**
     * Get the raw SQLite database handle
     * WARNING: Caller must acquire the mutex first
     */
    sqlite3* getHandle() const { return db_; }

    /**
     * Get mutex for thread-safe operations
     */
    std::mutex& getMutex() const { return mutex_; }

    /**
     * Close the database connection
     */
    void close();

    /**
     * Check if connection is open
     */
    bool isOpen() const { return db_ != nullptr; }

    /**
     * Get the database file path
     */
    const std::string& getPath() const { return db_path_; }

    /**
     * Get last insert row ID
     */
    int64_t getLastInsertRowId() const;

    /**
     * Get number of rows affected by last statement
     */
    int getChanges() const;

    /**
     * Execute a pragma statement
     */
    Result<bool> executePragma(const std::string& pragma);

private:
    void openConnection();
    void configurePragmas();

    std::string db_path_;
    sqlite3* db_;
    mutable std::mutex mutex_;
};

} // namespace sqlite
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQLITE_CONNECTION_MANAGER_HPP
