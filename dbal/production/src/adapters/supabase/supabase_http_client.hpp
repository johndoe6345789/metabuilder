#ifndef DBAL_SUPABASE_HTTP_CLIENT_HPP
#define DBAL_SUPABASE_HTTP_CLIENT_HPP

#include "isupabase_http_client.hpp"

namespace dbal {
namespace adapters {
namespace supabase {

/**
 * Concrete HTTP client — wraps the cpr library for Supabase REST API calls.
 *
 * Only instantiated by the daemon build (cpr is a daemon-only dep).
 * Unit tests inject a GMock implementation of ISupabaseHttpClient instead.
 *
 * REST API Endpoints:
 * - POST   /rest/v1/{entity}          — Create record(s)
 * - GET    /rest/v1/{entity}?filters  — List/read records
 * - PATCH  /rest/v1/{entity}?filters  — Update record(s)
 * - DELETE /rest/v1/{entity}?filters  — Delete record(s)
 */
class SupabaseHttpClient : public ISupabaseHttpClient {
public:
    SupabaseHttpClient(std::string base_url, std::string api_key, int timeout = 30000);

    void setAuthToken(const std::string& token);

    Result<Json> post(const std::string& endpoint, const Json& body) override;
    Result<Json> get(const std::string& resource_path) override;

    /// GET with Prefer: count=exact — parses Content-Range for total row count.
    Result<HttpListResponse> getList(const std::string& resource_path) override;

    Result<Json> patch(const std::string& resource_path, const Json& body) override;
    Result<bool> deleteRequest(const std::string& resource_path) override;

    std::string buildUrl(const std::string& path) const;
    const std::string& getApiKey() const { return api_key_; }

private:
    std::string buildAuthHeader() const;
    Result<Json> handleResponse(const std::string& text, int status_code) const;

    std::string base_url_;
    std::string api_key_;
    std::string auth_token_;
    int timeout_;
};

} // namespace supabase
} // namespace adapters
} // namespace dbal

#endif // DBAL_SUPABASE_HTTP_CLIENT_HPP
