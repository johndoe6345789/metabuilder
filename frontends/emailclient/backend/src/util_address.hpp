#pragma once

#include <string>
#include <vector>

namespace email_backend {

/// Splits a comma-separated address list (e.g. compose "cc"/"bcc" fields)
/// into trimmed, non-empty entries.
std::vector<std::string> splitAddressList(const std::string& csv);

/// Extracts a single header's unfolded value from a raw RFC 2822 header
/// block, as returned by IMAP `BODY.PEEK[HEADER]`. Case-insensitive on the
/// header name. Returns "" if the header is absent.
std::string extractHeader(const std::string& rawHeaders,
                           const std::string& name);

} // namespace email_backend
