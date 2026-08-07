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
    sqlite3_exec(db.get(), "PRAGMA journal_mode=WAL;", nullptr, nullptr, nullptr);
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
    int rc = sqlite3_exec(db.get(), sql, nullptr, nullptr, &errMsg);
    if (rc != SQLITE_OK) {
        std::string err = errMsg ? errMsg : "unknown error";
        sqlite3_free(errMsg);
        throw std::runtime_error("failed to init sqlite schema: " + err);
    }
}

std::string getUserSettingsJson(const std::string& userId) {
    auto db = openDb();
    sqlite3_stmt* stmt = nullptr;
    const char* sql = "SELECT settings_json FROM user_settings WHERE user_id = ?";
    if (sqlite3_prepare_v2(db.get(), sql, -1, &stmt, nullptr) != SQLITE_OK)
        throw std::runtime_error(sqlite3_errmsg(db.get()));

    std::string result = "{}";
    sqlite3_bind_text(stmt, 1, userId.c_str(), -1, SQLITE_TRANSIENT);
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        const unsigned char* text = sqlite3_column_text(stmt, 0);
        if (text)
            result = reinterpret_cast<const char*>(text);
    }
    sqlite3_finalize(stmt);
    return result;
}

void putUserSettingsJson(const std::string& userId, const std::string& json,
                          int64_t updatedAtMs) {
    auto db = openDb();
    const char* sql =
        "INSERT INTO user_settings (user_id, settings_json, updated_at) VALUES (?, ?, ?) "
        "ON CONFLICT(user_id) DO UPDATE SET settings_json = excluded.settings_json, "
        "updated_at = excluded.updated_at";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db.get(), sql, -1, &stmt, nullptr) != SQLITE_OK)
        throw std::runtime_error(sqlite3_errmsg(db.get()));

    sqlite3_bind_text(stmt, 1, userId.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, json.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int64(stmt, 3, updatedAtMs);
    if (sqlite3_step(stmt) != SQLITE_DONE) {
        std::string err = sqlite3_errmsg(db.get());
        sqlite3_finalize(stmt);
        throw std::runtime_error("failed to upsert user_settings: " + err);
    }
    sqlite3_finalize(stmt);
}

} // namespace pastebin
