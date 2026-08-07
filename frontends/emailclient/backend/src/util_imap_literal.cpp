#include "util_imap_literal.hpp"

namespace email_backend {

namespace {

// Consumes one `{N}` literal starting at `cur` (pointing at '{'), storing
// its bytes into rec.rawHeaders or rec.bodyText based on the keyword that
// preceded it in `meta` (which is truncated to drop that keyword). Returns
// the position just past the literal's bytes.
size_t consumeLiteral(const std::string& raw, size_t cur, std::string& meta,
                       FetchedMessage& rec) {
    const size_t n = raw.size();
    const size_t closeBrace = raw.find('}', cur);
    if (closeBrace == std::string::npos)
        return n;

    long litLen = 0;
    try {
        litLen = std::stol(raw.substr(cur + 1, closeBrace - cur - 1));
    } catch (...) {
        litLen = 0;
    }

    size_t kwEnd = meta.size();
    while (kwEnd > 0 && meta[kwEnd - 1] == ' ')
        kwEnd--;
    size_t kwStart = kwEnd;
    while (kwStart > 0 && meta[kwStart - 1] != ' ')
        kwStart--;
    const std::string keyword = meta.substr(kwStart, kwEnd - kwStart);
    meta.resize(kwStart);

    size_t litStart = closeBrace + 1;
    if (litStart < n && raw[litStart] == '\r')
        litStart++;
    if (litStart < n && raw[litStart] == '\n')
        litStart++;
    const size_t litLenSz = static_cast<size_t>(litLen < 0 ? 0 : litLen);
    const std::string literalData = raw.substr(litStart, litLenSz);

    if (keyword.find("HEADER") != std::string::npos)
        rec.rawHeaders = literalData;
    else if (keyword.find("TEXT") != std::string::npos)
        rec.bodyText = literalData;

    return litStart + litLenSz;
}

} // namespace

size_t consumeRecordBody(const std::string& raw, size_t parenPos,
                          FetchedMessage& rec, std::string& meta) {
    const size_t n = raw.size();
    size_t cur = parenPos + 1;
    int depth = 1;

    while (cur < n && depth > 0) {
        const char c = raw[cur];
        if (c == '(') {
            depth++;
            meta += c;
            cur++;
        } else if (c == ')') {
            depth--;
            if (depth > 0)
                meta += c;
            cur++;
        } else if (c == '{') {
            cur = consumeLiteral(raw, cur, meta, rec);
        } else {
            meta += c;
            cur++;
        }
    }
    return cur;
}

} // namespace email_backend
