/**
 * @file main.cpp
 * @brief Docker terminal backend entry point. Controllers auto-register
 * with Drogon via their METHOD_LIST_BEGIN/ADD_METHOD_TO macros -- see
 * src/controllers/.
 */

#include "util.hpp"

#include <drogon/drogon.h>

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
    drogon::app().registerPostHandlingAdvice(
        [](const drogon::HttpRequestPtr&,
           const drogon::HttpResponsePtr& r) { addCors(r); });

    const int port = dockerterminal::envInt("PORT", 5000);
    drogon::app()
        .addListener("0.0.0.0", static_cast<uint16_t>(port))
        .run();
    return 0;
}
