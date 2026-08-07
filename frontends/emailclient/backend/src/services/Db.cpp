#include "Db.hpp"

namespace email_backend {

namespace {
drogon::orm::DbClientPtr g_db;
}

void initDb(drogon::orm::DbClientPtr client) {
    g_db = std::move(client);
}

const drogon::orm::DbClientPtr& db() {
    return g_db;
}

} // namespace email_backend
