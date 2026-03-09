#ifndef DBAL_REQUESTS_CLIENT_HPP
#define DBAL_REQUESTS_CLIENT_HPP

#include <cpr/cpr.h>
#include <nlohmann/json.hpp>

#include <memory>
#include <stdexcept>
#include <string>
#include <unordered_map>

namespace dbal {
namespace runtime {

struct RequestsResponse {
    int statusCode;
    std::string body;
    nlohmann::json json;
    std::unordered_map<std::string, std::string> headers;
};

class RequestsClient {
public:
    explicit RequestsClient(std::string baseURL,
                            std::unordered_map<std::string, std::string> defaultHeaders = {})
        : baseUrl_(trimTrailingSlash(std::move(baseURL))),
          defaultHeaders_(std::move(defaultHeaders)) {}

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
        const cpr::Url url = cpr::Url{makeUrl(path)};
        cpr::Header cprHeaders;
        for (const auto& [key, value] : mergeHeaders(headers)) {
            cprHeaders.insert({key, value});
        }

        cpr::Response response;
        const cpr::Timeout timeout(timeoutMs);
        if (method == "GET") {
            response = cpr::Get(url, cprHeaders, timeout);
        } else if (method == "POST") {
            response = cpr::Post(url, cprHeaders, cpr::Body(body), timeout);
        } else {
            throw std::runtime_error("Unsupported HTTP method: " + method);
        }

        if (response.error) {
            throw std::runtime_error("HTTP request failed: " + response.error.message);
        }

        RequestsResponse result;
        result.statusCode = response.status_code;
        result.body = response.text;
        for (const auto& [key, value] : response.header) {
            result.headers[key] = value;
        }

        if (!response.text.empty()) {
            try {
                result.json = nlohmann::json::parse(response.text);
            } catch (const nlohmann::json::parse_error&) {
                // If parsing fails, leave json empty
                result.json = nlohmann::json();
            }
        }

        return result;
    }

private:
    static std::string trimTrailingSlash(std::string url) {
        while (!url.empty() && url.back() == '/') {
            url.pop_back();
        }
        return url;
    }

    std::string makeUrl(const std::string& path) const {
        if (path.empty()) {
            return baseUrl_;
        }
        if (path.front() == '/') {
            return baseUrl_ + path;
        }
        return baseUrl_ + "/" + path;
    }

    std::string baseUrl_;
    std::unordered_map<std::string, std::string> defaultHeaders_;

    std::unordered_map<std::string, std::string> mergeHeaders(
        const std::unordered_map<std::string, std::string>& headers) const {
        auto merged = defaultHeaders_;
        for (const auto& [key, value] : headers) {
            merged[key] = value;
        }
        return merged;
    }
};

}
}

#endif
