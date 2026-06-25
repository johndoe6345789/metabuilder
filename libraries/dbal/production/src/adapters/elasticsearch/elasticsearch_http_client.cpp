#include "elasticsearch_http_client.hpp"
#include <cpr/cpr.h>
#include <spdlog/spdlog.h>
#include <sstream>

namespace dbal {
namespace adapters {
namespace elasticsearch {

ElasticsearchHttpClient::ElasticsearchHttpClient(std::string base_url, std::string refresh_policy, bool verify_certs)
    : base_url_(std::move(base_url)),
      refresh_policy_(std::move(refresh_policy)),
      verify_certs_(verify_certs) {
}

std::string ElasticsearchHttpClient::buildUrl(const std::string& path, bool include_refresh) const {
    std::string url = base_url_ + path;

    if (include_refresh && !refresh_policy_.empty() && refresh_policy_ != "false") {
        url += (path.find('?') != std::string::npos) ? "&" : "?";
        url += "refresh=" + refresh_policy_;
    }

    return url;
}

Result<Json> ElasticsearchHttpClient::get(const std::string& path) {
    try {
        auto response = cpr::Get(
            cpr::Url{base_url_ + path},
            cpr::Header{{"Content-Type", "application/json"}, {"Accept", "application/json"}},
            cpr::VerifySsl{verify_certs_}
        );

        if (response.status_code == 404) {
            return Error(ErrorCode::NotFound, "Resource not found: " + path);
        }
        if (response.status_code >= 400) {
            return Error(ErrorCode::InternalError,
                        "Elasticsearch error (HTTP " + std::to_string(response.status_code) + "): " + response.text);
        }

        if (!response.text.empty()) {
            return Json::parse(response.text);
        }
        return Json::object();
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, "HTTP GET failed: " + std::string(e.what()));
    }
}

Result<Json> ElasticsearchHttpClient::head(const std::string& path) {
    try {
        auto response = cpr::Head(
            cpr::Url{base_url_ + path},
            cpr::Header{{"Content-Type", "application/json"}, {"Accept", "application/json"}},
            cpr::VerifySsl{verify_certs_}
        );

        if (response.status_code == 404) {
            return Error(ErrorCode::NotFound, "Resource not found: " + path);
        }
        if (response.status_code >= 400) {
            return Error(ErrorCode::InternalError,
                        "Elasticsearch error (HTTP " + std::to_string(response.status_code) + ")");
        }

        return Json::object();
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, "HTTP HEAD failed: " + std::string(e.what()));
    }
}

Result<Json> ElasticsearchHttpClient::post(const std::string& path, const Json& body, bool include_refresh) {
    try {
        auto response = cpr::Post(
            cpr::Url{buildUrl(path, include_refresh)},
            cpr::Header{{"Content-Type", "application/json"}, {"Accept", "application/json"}},
            cpr::Body{body.dump()},
            cpr::VerifySsl{verify_certs_}
        );

        if (response.status_code >= 400) {
            return Error(ErrorCode::InternalError,
                        "Elasticsearch error (HTTP " + std::to_string(response.status_code) + "): " + response.text);
        }

        if (!response.text.empty()) {
            return Json::parse(response.text);
        }
        return Json::object();
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, "HTTP POST failed: " + std::string(e.what()));
    }
}

Result<Json> ElasticsearchHttpClient::put(const std::string& path, const Json& body, bool include_refresh) {
    try {
        auto response = cpr::Put(
            cpr::Url{buildUrl(path, include_refresh)},
            cpr::Header{{"Content-Type", "application/json"}, {"Accept", "application/json"}},
            cpr::Body{body.dump()},
            cpr::VerifySsl{verify_certs_}
        );

        if (response.status_code >= 400) {
            return Error(ErrorCode::InternalError,
                        "Elasticsearch error (HTTP " + std::to_string(response.status_code) + "): " + response.text);
        }

        if (!response.text.empty()) {
            return Json::parse(response.text);
        }
        return Json::object();
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, "HTTP PUT failed: " + std::string(e.what()));
    }
}

Result<Json> ElasticsearchHttpClient::deleteRequest(const std::string& path, bool include_refresh) {
    try {
        auto response = cpr::Delete(
            cpr::Url{buildUrl(path, include_refresh)},
            cpr::Header{{"Content-Type", "application/json"}, {"Accept", "application/json"}},
            cpr::VerifySsl{verify_certs_}
        );

        if (response.status_code >= 400) {
            return Error(ErrorCode::InternalError,
                        "Elasticsearch error (HTTP " + std::to_string(response.status_code) + "): " + response.text);
        }

        if (!response.text.empty()) {
            return Json::parse(response.text);
        }
        return Json::object();
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, "HTTP DELETE failed: " + std::string(e.what()));
    }
}

Result<Json> ElasticsearchHttpClient::bulk(const std::vector<std::string>& ndjson_lines) {
    try {
        std::ostringstream body_stream;
        for (const auto& line : ndjson_lines) {
            body_stream << line << "\n";
        }
        std::string body = body_stream.str();

        std::string url = base_url_ + "/_bulk";
        if (!refresh_policy_.empty() && refresh_policy_ != "false") {
            url += "?refresh=" + refresh_policy_;
        }

        auto response = cpr::Post(
            cpr::Url{url},
            cpr::Header{{"Content-Type", "application/x-ndjson"}, {"Accept", "application/json"}},
            cpr::Body{body},
            cpr::VerifySsl{verify_certs_}
        );

        if (response.status_code >= 400) {
            return Error(ErrorCode::InternalError,
                        "Elasticsearch bulk request failed (HTTP " + std::to_string(response.status_code) + "): " + response.text);
        }

        return Json::parse(response.text);
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, "Bulk request failed: " + std::string(e.what()));
    }
}

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal
