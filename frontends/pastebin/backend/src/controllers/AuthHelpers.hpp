#pragma once

#include "Helpers.hpp"
#include "../services/JwtAuth.hpp"

#include <optional>

namespace pastebin {

/// Verifies the request's bearer token, writing a 401 via `cb` and
/// returning nullopt on failure -- mirrors the old Flask `@auth_required`
/// decorator, minus the HS256/local-auth branch (DBAL is the sole
/// identity provider now).
inline std::optional<AuthResult> requireAuth(const drogon::HttpRequestPtr& req,
                                              const ResponseCb& cb) {
    auto result = verifyBearerToken(req);
    if (!result)
        cb(errorResponse("Unauthorized", drogon::k401Unauthorized));
    return result;
}

} // namespace pastebin
