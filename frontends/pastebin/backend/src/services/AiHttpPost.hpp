#pragma once

#include "CurlHandle.hpp"

#include <string>

namespace pastebin {

struct RawHttpResponse {
    long status = 0; // 0 on a transport-level failure
    std::string body;
};

/// POSTs `bodyText` as-is to `url` with `headers` (caller sets
/// Content-Type/auth headers). A 30s timeout matches the old Flask
/// proxy's `_http.post(..., timeout=30)`.
RawHttpResponse httpPostJson(const std::string& url, const CurlSlist& headers,
                              const std::string& bodyText);

} // namespace pastebin
