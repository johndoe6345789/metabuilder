/**
 * @file ElasticClient.h
 * @brief Simplified Elasticsearch HTTP client for s3server.
 */

#pragma once

#include <drogon/HttpClient.h>
#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

#include <functional>
#include <string>

namespace s3
{

using json = nlohmann::json;
using EsCallback = std::function<void(const json&)>;
using EsErrback = std::function<void(const std::string&)>;

/// @brief Lightweight Elasticsearch client using Drogon HTTP.
class ElasticClient
{
  public:
    /// @brief Construct from ES_HOST / ES_PORT env vars.
    ElasticClient();

    /**
     * @brief Index (PUT) a document.
     * @param index  ES index name.
     * @param id     Document ID.
     * @param doc    JSON body to index.
     * @param onOk   Success callback with ES response.
     * @param onErr  Error callback with message.
     */
    void indexDoc(const std::string& index,
                  const std::string& id,
                  const json& doc,
                  EsCallback onOk,
                  EsErrback onErr);

    /**
     * @brief Search an index.
     * @param index  ES index name.
     * @param query  JSON query body.
     * @param onOk   Success callback with hits.
     * @param onErr  Error callback with message.
     */
    void search(const std::string& index,
                const json& query,
                EsCallback onOk,
                EsErrback onErr);

    /**
     * @brief Delete a document by ID.
     * @param index  ES index name.
     * @param id     Document ID.
     * @param onOk   Success callback.
     * @param onErr  Error callback.
     */
    void deleteDoc(const std::string& index,
                   const std::string& id,
                   EsCallback onOk,
                   EsErrback onErr);

    /**
     * @brief Check cluster health.
     * @param onOk   Callback with health JSON.
     * @param onErr  Error callback.
     */
    void health(EsCallback onOk, EsErrback onErr);

    /**
     * @brief Create an index with settings and mappings.
     * @param index     Index name.
     * @param body      Settings/mappings JSON.
     * @param onOk      Success callback.
     * @param onErr     Error callback.
     */
    void createIndex(const std::string& index,
                     const json& body,
                     EsCallback onOk,
                     EsErrback onErr);

  private:
    std::string host_;
    uint16_t port_;
    drogon::HttpClientPtr client_;

    /// @brief Send an HTTP request to Elasticsearch.
    void sendRequest(drogon::HttpMethod method,
                     const std::string& path,
                     const json& body,
                     EsCallback onOk,
                     EsErrback onErr);
};

} // namespace s3
