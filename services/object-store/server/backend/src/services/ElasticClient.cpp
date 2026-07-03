/**
 * @file ElasticClient.cpp
 * @brief ElasticClient core: constructor, indexDoc, search.
 */

#include "ElasticClient.h"

#include <cstdlib>

namespace s3
{

ElasticClient::ElasticClient()
{
    const char* h = std::getenv("ES_HOST");
    const char* p = std::getenv("ES_PORT");
    host_ = h ? h : "localhost";
    port_ = p ? static_cast<uint16_t>(std::stoi(p)) : 9200;

    auto loop = drogon::app().getLoop();
    client_ = drogon::HttpClient::newHttpClient(
        "http://" + host_ + ":" + std::to_string(port_),
        loop);

    spdlog::info("ElasticClient -> {}:{}", host_, port_);
}

void ElasticClient::sendRequest(drogon::HttpMethod method,
                                const std::string& path,
                                const json& body,
                                EsCallback onOk,
                                EsErrback onErr)
{
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(method);
    req->setPath(path);
    req->setContentTypeCode(drogon::CT_APPLICATION_JSON);

    if (!body.is_null())
        req->setBody(body.dump());

    client_->sendRequest(
        req,
        [onOk, onErr, path](drogon::ReqResult result,
                             const drogon::HttpResponsePtr& resp) {
            if (result != drogon::ReqResult::Ok) {
                onErr("ES request failed: " + path);
                return;
            }
            try {
                auto j = json::parse(resp->getBody());
                onOk(j);
            } catch (const std::exception& e) {
                onErr(std::string("ES parse error: ") + e.what());
            }
        });
}

void ElasticClient::indexDoc(const std::string& index,
                             const std::string& id,
                             const json& doc,
                             EsCallback onOk,
                             EsErrback onErr)
{
    auto path = "/" + index + "/_doc/" + id;
    spdlog::debug("ES indexDoc: {}", path);
    sendRequest(drogon::Put, path, doc, onOk, onErr);
}

void ElasticClient::search(const std::string& index,
                            const json& query,
                            EsCallback onOk,
                            EsErrback onErr)
{
    auto path = "/" + index + "/_search";
    spdlog::debug("ES search: {}", path);
    sendRequest(drogon::Post, path, query, onOk, onErr);
}

} // namespace s3
