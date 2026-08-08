/**
 * @file main.cpp
 * @brief Email service entry point. Controllers auto-register with Drogon
 * via their METHOD_LIST_BEGIN/ADD_METHOD_TO macros -- see src/controllers/.
 */

#include "util_env.hpp"

#include <drogon/drogon.h>

#include <cstdlib>
#include <iostream>

namespace {

void addCors(const drogon::HttpResponsePtr& r) {
    const std::string origins = email_backend::envOr("ALLOWED_ORIGINS", "*");
    r->addHeader("Access-Control-Allow-Origin", origins);
    r->addHeader("Access-Control-Allow-Headers",
                 "Content-Type, Authorization, X-Tenant-Id");
    r->addHeader("Access-Control-Allow-Methods",
                 "GET, POST, PUT, DELETE, OPTIONS");
}

} // namespace

int main() {
    using email_backend::envInt;

    try {
        drogon::app().registerPostHandlingAdvice(
            [](const drogon::HttpRequestPtr&,
               const drogon::HttpResponsePtr& r) { addCors(r); });

        const int port = envInt("PORT", 5000);
        drogon::app()
            .addListener("0.0.0.0", static_cast<uint16_t>(port))
            .run();
    } catch (const std::exception& e) {
        std::cerr << "email-service: " << e.what() << '\n';
        return 1;
    }
    return 0;
}
