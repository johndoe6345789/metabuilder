#include "util_imap_fetch.hpp"
#include "util_imap_literal.hpp"

#include <sstream>

namespace email_backend {

namespace {

void applyRecordMeta(const std::string& meta, FetchedMessage& rec) {
    std::istringstream ms(meta);
    std::string tok;
    while (ms >> tok) {
        if (tok == "UID") {
            long v = 0;
            if (ms >> v)
                rec.uid = v;
        }
    }
    rec.seen = meta.find("\\Seen") != std::string::npos;
}

} // namespace

std::vector<FetchedMessage> parseFetchResponse(const std::string& raw) {
    std::vector<FetchedMessage> out;
    const size_t n = raw.size();
    size_t i = 0;

    while (i < n) {
        const size_t star = raw.find("* ", i);
        if (star == std::string::npos)
            break;
        const size_t fetchWord = raw.find("FETCH", star);
        const size_t nextStar = raw.find("\n* ", star + 1);
        const bool looksLikeFetch =
            fetchWord != std::string::npos &&
            (nextStar == std::string::npos || fetchWord < nextStar);
        if (!looksLikeFetch) {
            i = star + 2;
            continue;
        }

        const size_t parenPos = raw.find('(', fetchWord);
        if (parenPos == std::string::npos)
            break;

        FetchedMessage rec;
        std::string meta;
        const size_t cur = consumeRecordBody(raw, parenPos, rec, meta);
        applyRecordMeta(meta, rec);

        out.push_back(rec);
        i = cur;
    }
    return out;
}

} // namespace email_backend
