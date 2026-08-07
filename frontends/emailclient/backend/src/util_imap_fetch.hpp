#pragma once

#include <string>
#include <vector>

namespace email_backend {

struct FetchedMessage {
    long uid = 0;
    bool seen = false;
    std::string rawHeaders;
    std::string bodyText;
};

/// Parses a raw multi-message IMAP UID FETCH response (as returned verbatim
/// by curl for `(FLAGS BODY.PEEK[HEADER] BODY.PEEK[TEXT])`) into individual
/// message records. Literal-aware: `{N}` byte-counted literals may contain
/// any bytes, including characters that look like IMAP syntax, so this
/// tracks an absolute byte cursor rather than scanning line by line.
std::vector<FetchedMessage> parseFetchResponse(const std::string& raw);

} // namespace email_backend
