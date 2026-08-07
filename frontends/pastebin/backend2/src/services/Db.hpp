#pragma once

#include <sqlite3.h>

#include <memory>

namespace pastebin {

struct SqliteCloser {
    void operator()(sqlite3* db) const {
        if (db)
            sqlite3_close(db);
    }
};
using SqlitePtr = std::unique_ptr<sqlite3, SqliteCloser>;

/// Opens a fresh connection to the local SQLite file (used for per-user
/// settings only -- everything else lives in DBAL). Mirrors the old
/// Flask app's `get_db()`, which also opened a new connection per call.
SqlitePtr openDb();

/// Creates the user_settings table if missing. Call once at startup.
void initDb();

} // namespace pastebin
