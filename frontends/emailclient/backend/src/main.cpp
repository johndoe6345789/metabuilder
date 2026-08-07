/**
 * @file main.cpp
 * @brief Email service entry point. Controllers auto-register with Drogon
 * via their METHOD_LIST_BEGIN/ADD_METHOD_TO macros -- see src/controllers/.
 */

#include "services/Db.hpp"
#include "util.hpp"

#include <drogon/drogon.h>

#include <chrono>
#include <cstdlib>
#include <iostream>
#include <thread>

namespace {

void addCors(const drogon::HttpResponsePtr& r) {
    std::string origins = email_backend::envOr("ALLOWED_ORIGINS", "*");
    r->addHeader("Access-Control-Allow-Origin", origins);
    r->addHeader("Access-Control-Allow-Headers",
                 "Content-Type, Authorization, X-Tenant-Id");
    r->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
}

void waitForDb(const drogon::orm::DbClientPtr& db) {
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

} // namespace

int main() {
    using email_backend::envInt;
    using email_backend::envOr;

    try {
        std::string conn = envOr(
            "DATABASE_URL",
            "host=localhost port=5432 dbname=email user=email password=email");
        auto dbClient = drogon::orm::DbClient::newPgClient(conn, 4);
        waitForDb(dbClient);
        email_backend::initDb(dbClient);

        drogon::app().registerPostHandlingAdvice(
            [](const drogon::HttpRequestPtr&, const drogon::HttpResponsePtr& r) {
                addCors(r);
            });

        int port = envInt("PORT", 5000);
        drogon::app().addListener("0.0.0.0", static_cast<uint16_t>(port)).run();
    } catch (const std::exception& e) {
        std::cerr << "email-service: " << e.what() << '\n';
        return 1;
    }
    return 0;
}
