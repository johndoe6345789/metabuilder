#include <drogon/drogon.h>
#include <drogon/orm/DbClient.h>
#include <sqlite3.h>

#include <chrono>
#include <algorithm>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

namespace
{

using drogon::HttpRequestPtr;
using drogon::HttpResponse;
using drogon::HttpResponsePtr;
using drogon::orm::DbClientPtr;

std::string envOr(const char* name, const std::string& fallback)
{
    if (const char* v = std::getenv(name); v && *v)
        return v;
    return fallback;
}

int envInt(const char* name, int fallback)
{
    if (const char* v = std::getenv(name); v && *v)
        return std::stoi(v);
    return fallback;
}

std::string nowIso()
{
    auto t = std::chrono::system_clock::to_time_t(
        std::chrono::system_clock::now());
    char buf[32];
    std::strftime(buf, sizeof buf, "%Y-%m-%dT%H:%M:%SZ", std::gmtime(&t));
    return buf;
}

Json::Value parseJson(const std::string& text)
{
    Json::Value out;
    Json::CharReaderBuilder b;
    std::string errs;
    std::istringstream in(text);
    if (!Json::parseFromStream(b, in, &out, &errs))
        throw std::runtime_error(errs);
    return out;
}

std::string jsonText(const Json::Value& v)
{
    Json::StreamWriterBuilder b;
    b["indentation"] = "";
    return Json::writeString(b, v);
}

HttpResponsePtr jsonResponse(const Json::Value& v,
                             drogon::HttpStatusCode code = drogon::k200OK)
{
    auto r = HttpResponse::newHttpJsonResponse(v);
    r->setStatusCode(code);
    return r;
}

HttpResponsePtr errorResponse(const std::string& msg,
                              drogon::HttpStatusCode code)
{
    Json::Value e;
    e["error"] = msg;
    return jsonResponse(e, code);
}

std::string readFile(const std::filesystem::path& p)
{
    std::ifstream in(p);
    if (!in)
        throw std::runtime_error("failed to read " + p.string());
    std::ostringstream ss;
    ss << in.rdbuf();
    return ss.str();
}

std::vector<std::string> sqlStatements(const std::string& sql)
{
    std::vector<std::string> out;
    std::string cur;
    bool single = false;
    for (char c : sql) {
        if (c == '\'')
            single = !single;
        if (c == ';' && !single) {
            if (cur.find_first_not_of(" \n\r\t") != std::string::npos)
                out.push_back(cur);
            cur.clear();
            continue;
        }
        cur += c;
    }
    if (cur.find_first_not_of(" \n\r\t") != std::string::npos)
        out.push_back(cur);
    return out;
}

class Store
{
  public:
    explicit Store(DbClientPtr db) : db_(std::move(db)) {}

    void applyMigrations(const std::filesystem::path& dir)
    {
        std::vector<std::filesystem::path> files;
        for (const auto& e : std::filesystem::directory_iterator(dir))
            if (e.is_regular_file() && e.path().extension() == ".sql")
                files.push_back(e.path());
        std::sort(files.begin(), files.end());
        for (const auto& file : files)
            for (const auto& stmt : sqlStatements(readFile(file)))
                db_->execSqlSync(stmt);
    }

    Json::Value keys()
    {
        auto rows = db_->execSqlSync("SELECT key FROM storage ORDER BY key");
        Json::Value out(Json::arrayValue);
        for (const auto& row : rows)
            out.append(row["key"].as<std::string>());
        return out;
    }

    std::optional<Json::Value> get(const std::string& key)
    {
        auto rows =
            db_->execSqlSync("SELECT value::text AS value FROM storage "
                             "WHERE key = $1", key);
        if (rows.empty())
            return std::nullopt;
        return parseJson(rows[0]["value"].as<std::string>());
    }

    void set(const std::string& key, const Json::Value& value)
    {
        db_->execSqlSync(
            "INSERT INTO storage (key, value, created_at, updated_at) "
            "VALUES ($1, $2::jsonb, NOW(), NOW()) "
            "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "
            "updated_at = EXCLUDED.updated_at",
            key, jsonText(value));
    }

    bool remove(const std::string& key)
    {
        auto rows = db_->execSqlSync(
            "DELETE FROM storage WHERE key = $1 RETURNING key", key);
        return !rows.empty();
    }

    void clear() { db_->execSqlSync("DELETE FROM storage"); }

    Json::Value exportAll()
    {
        auto rows =
            db_->execSqlSync("SELECT key, value::text AS value FROM storage");
        Json::Value out(Json::objectValue);
        for (const auto& row : rows)
            out[row["key"].as<std::string>()] =
                parseJson(row["value"].as<std::string>());
        return out;
    }

    Json::Value stats()
    {
        auto rows = db_->execSqlSync(
            "SELECT COUNT(*)::bigint AS count, "
            "COALESCE(SUM(length(value::text)), 0)::bigint AS total_size "
            "FROM storage");
        Json::Value out;
        out["total_keys"] =
            static_cast<Json::Int64>(rows[0]["count"].as<long long>());
        out["total_size_bytes"] =
            static_cast<Json::Int64>(rows[0]["total_size"].as<long long>());
        out["database"] = "postgres";
        return out;
    }

    int migrateSqlite(const std::filesystem::path& path)
    {
        if (path.empty() || !std::filesystem::exists(path))
            return 0;
        sqlite3* raw = nullptr;
        if (sqlite3_open_v2(path.c_str(), &raw, SQLITE_OPEN_READONLY,
                            nullptr) != SQLITE_OK)
            throw std::runtime_error("failed to open sqlite migration DB");
        std::unique_ptr<sqlite3, decltype(&sqlite3_close)> sqlite(raw,
                                                                  sqlite3_close);
        sqlite3_stmt* stmtRaw = nullptr;
        const char* sql = "SELECT key, value FROM storage";
        if (sqlite3_prepare_v2(sqlite.get(), sql, -1, &stmtRaw, nullptr) !=
            SQLITE_OK)
            throw std::runtime_error(sqlite3_errmsg(sqlite.get()));
        std::unique_ptr<sqlite3_stmt, decltype(&sqlite3_finalize)> stmt(
            stmtRaw, sqlite3_finalize);

        int count = 0;
        while (sqlite3_step(stmt.get()) == SQLITE_ROW) {
            auto key = reinterpret_cast<const char*>(
                sqlite3_column_text(stmt.get(), 0));
            auto val = reinterpret_cast<const char*>(
                sqlite3_column_text(stmt.get(), 1));
            set(key, parseJson(val));
            ++count;
        }
        return count;
    }

  private:
    DbClientPtr db_;
};

std::shared_ptr<Store> store;

void waitForDb(const DbClientPtr& db)
{
    std::string last;
    for (int i = 0; i < 30; ++i) {
        try {
            db->execSqlSync("SELECT 1");
            return;
        } catch (const std::exception& e) {
            last = e.what();
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }
    }
    throw std::runtime_error("database not ready: " + last);
}

void addCors(const HttpResponsePtr& r)
{
    std::string origins = envOr("ALLOWED_ORIGINS", "*");
    r->addHeader("Access-Control-Allow-Origin", origins == "*" ? "*" : origins);
    r->addHeader("Access-Control-Allow-Headers",
                 "Content-Type, Authorization, X-Requested-With");
    r->addHeader("Access-Control-Allow-Methods",
                 "GET, POST, PUT, DELETE, OPTIONS");
    r->addHeader("Access-Control-Allow-Credentials", "true");
}

void guarded(std::function<Json::Value()> fn,
             std::function<void(const HttpResponsePtr&)>&& cb)
{
    try {
        cb(jsonResponse(fn()));
    } catch (const std::exception& e) {
        cb(errorResponse(e.what(), drogon::k500InternalServerError));
    }
}

} // namespace

int main()
{
    try {
        std::string conn = envOr("DATABASE_URL",
                                 "host=codegen-db port=5432 dbname=codegen "
                                 "user=codegen password=codegen");
        auto db = drogon::orm::DbClient::newPgClient(conn, 2);
        waitForDb(db);
        store = std::make_shared<Store>(db);
        store->applyMigrations(envOr("MIGRATIONS_DIR", "/app/migrations"));

        std::string sqlitePath =
            envOr("SQLITE_MIGRATION_PATH", envOr("DATABASE_PATH", ""));
        int migrated = store->migrateSqlite(sqlitePath);
        if (migrated > 0)
            std::cout << "migrated " << migrated
                      << " rows from sqlite " << sqlitePath << '\n';

        drogon::app().registerPostHandlingAdvice(
            [](const HttpRequestPtr&, const HttpResponsePtr& r) { addCors(r); });

        drogon::app().registerHandler(
            "/health",
            [](const HttpRequestPtr&,
               std::function<void(const HttpResponsePtr&)>&& cb) {
                Json::Value out;
                out["status"] = "ok";
                out["timestamp"] = nowIso();
                cb(jsonResponse(out));
            });

        drogon::app().registerHandler(
            "/api/storage/keys",
            [](const HttpRequestPtr&,
               std::function<void(const HttpResponsePtr&)>&& cb) {
                guarded([] {
                    Json::Value out;
                    out["keys"] = store->keys();
                    return out;
                }, std::move(cb));
            });

        drogon::app().registerHandler(
            "/api/storage/clear",
            [](const HttpRequestPtr&,
               std::function<void(const HttpResponsePtr&)>&& cb) {
                guarded([] {
                    store->clear();
                    Json::Value out;
                    out["success"] = true;
                    return out;
                }, std::move(cb));
            },
            {drogon::Post});

        drogon::app().registerHandler(
            "/api/storage/export",
            [](const HttpRequestPtr&,
               std::function<void(const HttpResponsePtr&)>&& cb) {
                guarded([] { return store->exportAll(); }, std::move(cb));
            });

        drogon::app().registerHandler(
            "/api/storage/import",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& cb) {
                try {
                    auto body = req->getJsonObject();
                    if (!body || !body->isObject()) {
                        cb(errorResponse("Data must be an object",
                                         drogon::k400BadRequest));
                        return;
                    }
                    auto names = body->getMemberNames();
                    for (const auto& key : names)
                        store->set(key, (*body)[key]);
                    Json::Value out;
                    out["success"] = true;
                    out["imported"] =
                        static_cast<Json::UInt64>(names.size());
                    cb(jsonResponse(out));
                } catch (const std::exception& e) {
                    cb(errorResponse(e.what(),
                                     drogon::k500InternalServerError));
                }
            },
            {drogon::Post});

        drogon::app().registerHandler(
            "/api/storage/stats",
            [](const HttpRequestPtr&,
               std::function<void(const HttpResponsePtr&)>&& cb) {
                guarded([] { return store->stats(); }, std::move(cb));
            });

        drogon::app().registerHandler(
            "/api/storage/{1}",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& cb,
               std::string key) {
                try {
                    if (req->method() == drogon::Get) {
                        auto value = store->get(key);
                        if (!value) {
                            cb(errorResponse("Key not found",
                                             drogon::k404NotFound));
                            return;
                        }
                        Json::Value out;
                        out["value"] = *value;
                        cb(jsonResponse(out));
                    } else if (req->method() == drogon::Delete) {
                        if (!store->remove(key)) {
                            cb(errorResponse("Key not found",
                                             drogon::k404NotFound));
                            return;
                        }
                        Json::Value out;
                        out["success"] = true;
                        cb(jsonResponse(out));
                    } else {
                        auto body = req->getJsonObject();
                        if (!body || !body->isMember("value")) {
                            cb(errorResponse("Missing value field",
                                             drogon::k400BadRequest));
                            return;
                        }
                        store->set(key, (*body)["value"]);
                        Json::Value out;
                        out["success"] = true;
                        cb(jsonResponse(out));
                    }
                } catch (const std::exception& e) {
                    cb(errorResponse(e.what(),
                                     drogon::k500InternalServerError));
                }
            },
            {drogon::Get, drogon::Post, drogon::Put, drogon::Delete});

        drogon::app().addListener("0.0.0.0", envInt("PORT", 5001));
        drogon::app().run();
    } catch (const std::exception& e) {
        std::cerr << "codegen-backend: " << e.what() << '\n';
        return 1;
    }
    return 0;
}
