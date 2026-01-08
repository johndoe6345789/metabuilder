#pragma once

#include <cpr/cpr.h>
#include <string>

class HttpClient {
public:
  explicit HttpClient(std::string base_url);

  cpr::Response get(const std::string &path) const;
  cpr::Response post(const std::string &path,
                     const std::string &body,
                     const std::string &content_type = "application/json") const;
  cpr::Response put(const std::string &path,
                    const std::string &body,
                    const std::string &content_type = "application/json") const;
  cpr::Response patch(const std::string &path,
                      const std::string &body,
                      const std::string &content_type = "application/json") const;
  cpr::Response del(const std::string &path) const;

  [[nodiscard]] const std::string &base_url() const noexcept;

private:
  std::string base_url_;
};
