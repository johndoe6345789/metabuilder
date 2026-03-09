#include "utils/http_client.h"

#include <stdexcept>

namespace {

std::string build_url(const std::string &base, const std::string &path) {
  std::string result = base;
  if (!result.empty() && result.back() == '/') {
    result.pop_back();
  }

  if (!path.empty()) {
    if (path.front() != '/') {
      result.push_back('/');
    }
    result.append(path);
  }

  return result;
}

} // namespace

HttpClient::HttpClient(std::string base_url) : base_url_(std::move(base_url)) {
  if (base_url_.empty()) {
    throw std::invalid_argument("base URL cannot be empty");
  }
}

cpr::Response HttpClient::get(const std::string &path) const {
  return cpr::Get(cpr::Url{build_url(base_url_, path)});
}

cpr::Response HttpClient::post(const std::string &path,
                               const std::string &body,
                               const std::string &content_type) const {
  return cpr::Post(cpr::Url{build_url(base_url_, path)},
                   cpr::Body{body},
                   cpr::Header{{"Content-Type", content_type}});
}

cpr::Response HttpClient::put(const std::string &path,
                              const std::string &body,
                              const std::string &content_type) const {
  return cpr::Put(cpr::Url{build_url(base_url_, path)},
                  cpr::Body{body},
                  cpr::Header{{"Content-Type", content_type}});
}

cpr::Response HttpClient::patch(const std::string &path,
                                const std::string &body,
                                const std::string &content_type) const {
  return cpr::Patch(cpr::Url{build_url(base_url_, path)},
                    cpr::Body{body},
                    cpr::Header{{"Content-Type", content_type}});
}

cpr::Response HttpClient::del(const std::string &path) const {
  return cpr::Delete(cpr::Url{build_url(base_url_, path)});
}

const std::string &HttpClient::base_url() const noexcept { return base_url_; }
