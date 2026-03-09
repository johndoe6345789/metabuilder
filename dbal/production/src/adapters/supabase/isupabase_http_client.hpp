#ifndef DBAL_ISUPABASE_HTTP_CLIENT_HPP
#define DBAL_ISUPABASE_HTTP_CLIENT_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace supabase {

using Json = nlohmann::json;

/// Items + total-count returned by a list-with-count HTTP call.
/// total == -1 means the server did not return a Content-Range header.
struct HttpListResponse {
    Json items;
    int  total = -1;
};

/**
 * Pure-virtual HTTP client interface for the Supabase adapter.
 *
 * Separating this interface from SupabaseHttpClient (which depends on cpr)
 * lets unit tests inject a GMock implementation without linking cpr at all.
 */
class ISupabaseHttpClient {
public:
    virtual ~ISupabaseHttpClient() = default;

    /// POST /rest/v1/{endpoint}  — create / createMany / upsert
    virtual Result<Json> post(const std::string& endpoint, const Json& body) = 0;

    /// GET  /rest/v1/{resource_path}  — read / findFirst / findByField
    virtual Result<Json> get(const std::string& resource_path) = 0;

    /// GET  /rest/v1/{resource_path} with Prefer: count=exact
    /// Parses Content-Range: *\/N header for accurate total.
    virtual Result<HttpListResponse> getList(const std::string& resource_path) = 0;

    /// PATCH /rest/v1/{resource_path}  — update / updateMany
    virtual Result<Json> patch(const std::string& resource_path, const Json& body) = 0;

    /// DELETE /rest/v1/{resource_path}  — remove / deleteMany
    virtual Result<bool> deleteRequest(const std::string& resource_path) = 0;
};

} // namespace supabase
} // namespace adapters
} // namespace dbal

#endif // DBAL_ISUPABASE_HTTP_CLIENT_HPP
