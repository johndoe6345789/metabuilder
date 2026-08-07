#pragma once

#include <nlohmann/json.hpp>

#include <optional>
#include <string>
#include <vector>

namespace pastebin {

struct DbalResponse {
    long status = 0;
    nlohmann::json body;

    bool ok() const { return status >= 200 && status < 300; }
};

/// Thin REST client for DBAL, mirroring the old Flask app's `dbal_request`
/// helper: calls `{DBAL_BASE_URL}{path}` with the admin bearer token,
/// JSON in/out. Non-fatal on any error -- returns std::nullopt rather than
/// throwing, same as the Python version returning None.
std::optional<DbalResponse> dbalRequest(
    const std::string& method, const std::string& path,
    const nlohmann::json* jsonBody = nullptr);

/// Fetches every page from a DBAL list endpoint (handles DBAL's
/// {data: {data: [...], total: N}} pagination envelope), mirroring
/// `_dbal_all_pages`.
std::vector<nlohmann::json> dbalAllPages(const std::string& pathWithParams,
                                          int limit = 500);

} // namespace pastebin
