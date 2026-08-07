#include "Db.hpp"
#include "../util.hpp"

#include <stdexcept>

namespace pastebin {

namespace {
std::string dbPath() {
    return envOr("DATABASE_PATH", "pastebin.db");
}
} // namespace

SqlitePtr openDb() {
    sqlite3* raw = nullptr;
    if (sqlite3_open(dbPath().c_str(), &raw) != SQLITE_OK) {
        std::string err = raw ? sqlite3_errmsg(raw) : "unknown error";
        if (raw)
            sqlite3_close(raw);
        throw std::runtime_error("failed to open sqlite db: " + err);
    }
    sqlite3_busy_timeout(raw, 5000);
    SqlitePtr db(raw);
    sqlite3_exec(db.get(), "PRAGMA journal_mode=WAL;", nullptr, nullptr,
                 nullptr);
    return db;
}

void initDb() {
    auto db = openDb();
    const char* sql =
        "CREATE TABLE IF NOT EXISTS user_settings ("
        "  user_id TEXT PRIMARY KEY,"
        "  settings_json TEXT NOT NULL DEFAULT '{}',"
        "  updated_at INTEGER"
        ");";
    char* errMsg = nullptr;
    const int rc = sqlite3_exec(db.get(), sql, nullptr, nullptr, &errMsg);
    if (rc != SQLITE_OK) {
        std::string err = errMsg ? errMsg : "unknown error";
        sqlite3_free(errMsg);
        throw std::runtime_error("failed to init sqlite schema: " + err);
    }
}

} // namespace pastebin
