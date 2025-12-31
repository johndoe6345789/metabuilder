#ifndef DBAL_REQUESTS_CLIENT_HPP
#define DBAL_REQUESTS_CLIENT_HPP

#include <chrono>
#include <future>
#include <string>
#include <unordered_map>
#include <vector>

#include <drogon/HttpClient.h>
#include <drogon/HttpReqImpl.h>
#include <drogon/HttpResponse.h>
#include <drogon/HttpTypes.h>
#include <drogon/Json.h>

namespace dbal {
namespace runtime {

struct RequestsResponse {
    int statusCode;
    std::string body;
    drogon::Json::Value json;
    std::unordered_map<std::string, std::string> headers;
};

class RequestsClient {
public:
    explicit RequestsClient(const std::string& baseURL)
        : client_(drogon::HttpClient::newHttpClient(baseURL)) {}

    RequestsResponse get(const std::string& path,
                         const std::unordered_map<std::string, std::string>& headers = {},
                         int timeoutMs = 30'000) {
        return request("GET", path, headers, {}, timeoutMs);
    }

    RequestsResponse post(const std::string& path,
                          const std::string& body,
                          const std::unordered_map<std::string, std::string>& headers = {},
                          int timeoutMs = 30'000) {
        return request("POST", path, headers, body, timeoutMs);
    }

    RequestsResponse request(const std::string& method,
                             const std::string& path,
                             const std::unordered_map<std::string, std::string>& headers = {},
                             const std::string& body = {},
                             int timeoutMs = 30'000) {
        drogon::HttpRequestPtr req = drogon::HttpRequest::newHttpRequest();
        req->setMethod(drogon::HttpMethod::fromString(method));
        req->setPath(path);
        req->setBody(body);
        for (const auto& [key, value] : headers) {
            req->addHeader(key, value);
        }

        std::promise<RequestsResponse> promise;
        auto future = promise.get_future();

        client_->sendRequest(req, [p = std::move(promise), timeoutMs](drogon::ReqResult result, const drogon::HttpResponsePtr& resp) mutable {
            RequestsResponse response;
            response.statusCode = resp ? resp->getStatusCode() : 0;
            response.body = resp ? resp->getBody() : "";
            if (resp) {
                response.headers = resp->getHeaders();
                try {
                    response.json = drogon::Json::parse(resp->getBody());
                } catch (...) {
                }
            }
            p.set_value(std::move(response));
        });

        if (future.wait_for(std::chrono::milliseconds(timeoutMs)) == std::future_status::timeout) {
            throw std::runtime_error("HTTP request timed out");
        }

        return future.get();
    }

private:
    drogon::HttpClientPtr client_;
};

}
}

#endif
