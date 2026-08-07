#pragma once

#include <drogon/orm/DbClient.h>

namespace email_backend {

void initDb(drogon::orm::DbClientPtr client);
const drogon::orm::DbClientPtr& db();

} // namespace email_backend
