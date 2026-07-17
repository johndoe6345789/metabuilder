/**
 * @file ElasticClientOps.cpp
 * @brief ElasticClient operations: deleteDoc, health, createIndex.
 */

#include "ElasticClient.h"

namespace s3
{

void ElasticClient::deleteDoc(const std::string& index,
                              const std::string& id,
                              EsCallback onOk,
                              EsErrback onErr)
{
    auto path = "/" + index + "/_doc/" + id;
    spdlog::debug("ES deleteDoc: {}", path);
    sendRequest(drogon::Delete, path, json(nullptr), onOk, onErr);
}

void ElasticClient::health(EsCallback onOk, EsErrback onErr)
{
    spdlog::debug("ES health check");
    sendRequest(
        drogon::Get, "/_cluster/health", json(nullptr), onOk, onErr);
}

void ElasticClient::createIndex(const std::string& index,
                                const json& body,
                                EsCallback onOk,
                                EsErrback onErr)
{
    auto path = "/" + index;
    spdlog::info("ES createIndex: {}", path);
    sendRequest(drogon::Put, path, body, onOk, onErr);
}

} // namespace s3
