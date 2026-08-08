#pragma once

#include "Helpers.hpp"
#include "../services/JwtAuth.hpp"

#include <optional>

namespace email_backend {

/// Verifies the request's bearer token, writing a 401 via `cb` and
/// returning nullopt on failure. DBAL is the sole identity provider for
/// this backend -- there is no local password auth or HS256 fallback.
inline std::optional<AuthResult> requireAuth(const drogon::HttpRequestPtr& req,
                                              const ResponseCb& cb) {
    auto result = verifyBearerToken(req);
    if (!result)
        cb(errorResponse("Unauthorized", drogon::k401Unauthorized));
    return result;
}

} // namespace email_backend
