#include "response.hpp"

#include <drogon/drogon.h>

namespace dbal {
namespace daemon {

drogon::HttpResponsePtr build_json_response(const ::Json::Value& body) {
    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    response->addHeader("Server", "DBAL/1.2.1");
    return response;
}

} // namespace daemon
} // namespace dbal
