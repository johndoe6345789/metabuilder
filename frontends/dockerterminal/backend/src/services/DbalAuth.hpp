#pragma once

#include <drogon/HttpRequest.h>

#include <optional>
#include <string>

namespace dockerterminal {

/// Verifies the caller's DBAL OIDC bearer token via /oidc/userinfo and
/// requires an admin-tier role (Docker exec grants full host access via
/// the mounted socket, so this is deliberately stricter than "any
/// authenticated user"). Returns the username on success.
std::optional<std::string> verifyAdminCaller(const drogon::HttpRequestPtr& req);

} // namespace dockerterminal
