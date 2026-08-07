/**
 * @file main.cpp
 * @brief Pastebin backend entry point. Controllers auto-register with
 * Drogon via their METHOD_LIST_BEGIN/ADD_METHOD_TO macros -- see
 * src/controllers/.
 */

#include "services/Db.hpp"
#include "util.hpp"

#include <drogon/drogon.h>

#include <iostream>

namespace {

void addCors(const drogon::HttpResponsePtr& r) {
    r->addHeader("Access-Control-Allow-Origin", "*");
    r->addHeader("Access-Control-Allow-Headers",
                 "Content-Type, Authorization");
    r->addHeader("Access-Control-Allow-Methods",
                 "GET, POST, PUT, DELETE, OPTIONS");
}

} // namespace

int main() {
    try {
        pastebin::initDb();

        drogon::app().registerPostHandlingAdvice(
            [](const drogon::HttpRequestPtr&,
               const drogon::HttpResponsePtr& r) { addCors(r); });

        const int port = pastebin::envInt("PORT", 5000);
        drogon::app()
            .addListener("0.0.0.0", static_cast<uint16_t>(port))
            .run();
    } catch (const std::exception& e) {
        std::cerr << "pastebin-backend: " << e.what() << '\n';
        return 1;
    }
    return 0;
}
