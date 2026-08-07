#include "util.hpp"

#include <cctype>
#include <chrono>
#include <cstdlib>
#include <ctime>
#include <sstream>

namespace email_backend {

std::string envOr(const char* name, const std::string& fallback) {
    if (const char* v = std::getenv(name); v && *v)
        return v;
    return fallback;
}

int envInt(const char* name, int fallback) {
    if (const char* v = std::getenv(name); v && *v)
        return std::stoi(v);
    return fallback;
}

std::string nowIso() {
    auto t = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    char buf[32];
    std::strftime(buf, sizeof buf, "%Y-%m-%dT%H:%M:%SZ", std::gmtime(&t));
    return buf;
}

std::vector<std::string> splitAddressList(const std::string& csv) {
    std::vector<std::string> out;
    std::stringstream ss(csv);
    std::string item;
    while (std::getline(ss, item, ',')) {
        size_t a = item.find_first_not_of(" \t");
        if (a == std::string::npos)
            continue;
        size_t b = item.find_last_not_of(" \t");
        out.push_back(item.substr(a, b - a + 1));
    }
    return out;
}

namespace {

bool iequalsPrefix(const std::string& line, const std::string& prefix) {
    if (line.size() < prefix.size())
        return false;
    for (size_t i = 0; i < prefix.size(); ++i)
        if (std::tolower(static_cast<unsigned char>(line[i])) !=
            std::tolower(static_cast<unsigned char>(prefix[i])))
            return false;
    return true;
}

} // namespace

std::string extractHeader(const std::string& rawHeaders, const std::string& name) {
    std::istringstream in(rawHeaders);
    std::string line;
    std::string value;
    bool capturing = false;
    std::string prefix = name + ":";

    while (std::getline(in, line)) {
        if (!line.empty() && line.back() == '\r')
            line.pop_back();

        if (capturing && !line.empty() && (line[0] == ' ' || line[0] == '\t')) {
            size_t start = line.find_first_not_of(" \t");
            if (start != std::string::npos) {
                value += ' ';
                value += line.substr(start);
            }
            continue;
        }
        capturing = false;

        if (iequalsPrefix(line, prefix)) {
            size_t start = line.find_first_not_of(" \t", prefix.size());
            value = start == std::string::npos ? "" : line.substr(start);
            capturing = true;
        }
    }
    return value;
}

std::string buildMimeMessage(const MimeMessage& msg, const std::string& boundary) {
    std::ostringstream out;
    out << "From: " << msg.from << "\r\n";
    out << "To: " << msg.to << "\r\n";
    if (!msg.cc.empty())
        out << "Cc: " << msg.cc << "\r\n";
    if (!msg.replyTo.empty())
        out << "Reply-To: " << msg.replyTo << "\r\n";
    out << "Subject: " << msg.subject << "\r\n";
    out << "MIME-Version: 1.0\r\n";

    if (!msg.bodyHtml.empty()) {
        out << "Content-Type: multipart/alternative; boundary=\"" << boundary << "\"\r\n\r\n";
        out << "--" << boundary << "\r\n";
        out << "Content-Type: text/plain; charset=utf-8\r\n\r\n";
        out << msg.bodyText << "\r\n\r\n";
        out << "--" << boundary << "\r\n";
        out << "Content-Type: text/html; charset=utf-8\r\n\r\n";
        out << msg.bodyHtml << "\r\n\r\n";
        out << "--" << boundary << "--\r\n";
    } else {
        out << "Content-Type: text/plain; charset=utf-8\r\n\r\n";
        out << msg.bodyText << "\r\n";
    }
    return out.str();
}

std::optional<ImapListEntry> parseImapListLine(const std::string& lineIn) {
    std::string line = lineIn;
    while (!line.empty() && (line.back() == '\r' || line.back() == '\n'))
        line.pop_back();

    size_t listPos = line.find(" LIST ");
    if (listPos == std::string::npos)
        return std::nullopt;

    size_t p1 = line.find('(', listPos);
    if (p1 == std::string::npos)
        return std::nullopt;
    size_t p2 = line.find(')', p1);
    if (p2 == std::string::npos)
        return std::nullopt;

    ImapListEntry entry;
    std::istringstream flagsStream(line.substr(p1 + 1, p2 - p1 - 1));
    std::string flag;
    while (flagsStream >> flag)
        entry.flags.push_back(flag);

    std::string rest = line.substr(p2 + 1);
    size_t i = rest.find_first_not_of(' ');
    rest = i == std::string::npos ? "" : rest.substr(i);

    auto readToken = [&rest]() -> std::string {
        if (rest.empty())
            return "";
        std::string tok;
        if (rest[0] == '"') {
            size_t end = rest.find('"', 1);
            if (end == std::string::npos) {
                tok = rest.substr(1);
                rest.clear();
                return tok;
            }
            tok = rest.substr(1, end - 1);
            rest = rest.substr(end + 1);
        } else {
            size_t end = rest.find(' ');
            tok = end == std::string::npos ? rest : rest.substr(0, end);
            rest = end == std::string::npos ? "" : rest.substr(end + 1);
        }
        size_t j = rest.find_first_not_of(' ');
        rest = j == std::string::npos ? "" : rest.substr(j);
        return tok;
    };

    entry.delimiter = readToken();
    if (entry.delimiter == "NIL")
        entry.delimiter = "";
    entry.name = readToken();
    if (entry.name.empty())
        return std::nullopt;
    return entry;
}

std::vector<FetchedMessage> parseFetchResponse(const std::string& raw) {
    std::vector<FetchedMessage> out;
    size_t n = raw.size();
    size_t i = 0;

    while (i < n) {
        size_t star = raw.find("* ", i);
        if (star == std::string::npos)
            break;
        size_t fetchWord = raw.find("FETCH", star);
        size_t nextStar = raw.find("\n* ", star + 1);
        bool looksLikeFetch =
            fetchWord != std::string::npos &&
            (nextStar == std::string::npos || fetchWord < nextStar);
        if (!looksLikeFetch) {
            i = star + 2;
            continue;
        }

        size_t parenPos = raw.find('(', fetchWord);
        if (parenPos == std::string::npos)
            break;

        FetchedMessage rec;
        size_t cur = parenPos + 1;
        int depth = 1;
        std::string meta; // non-literal text within this record, for UID/FLAGS

        while (cur < n && depth > 0) {
            char c = raw[cur];
            if (c == '(') {
                depth++;
                meta += c;
                cur++;
                continue;
            }
            if (c == ')') {
                depth--;
                if (depth > 0)
                    meta += c;
                cur++;
                continue;
            }
            if (c == '{') {
                size_t closeBrace = raw.find('}', cur);
                if (closeBrace == std::string::npos) {
                    cur = n;
                    break;
                }
                long litLen = 0;
                try {
                    litLen = std::stol(raw.substr(cur + 1, closeBrace - cur - 1));
                } catch (...) {
                    litLen = 0;
                }

                // The keyword this literal belongs to (e.g. "BODY[HEADER]")
                // is the token immediately preceding '{' in `meta`, modulo
                // any separating whitespace.
                size_t kwEnd = meta.size();
                while (kwEnd > 0 && meta[kwEnd - 1] == ' ')
                    kwEnd--;
                size_t kwStart = kwEnd;
                while (kwStart > 0 && meta[kwStart - 1] != ' ')
                    kwStart--;
                std::string keyword = meta.substr(kwStart, kwEnd - kwStart);
                meta.resize(kwStart);

                size_t litStart = closeBrace + 1;
                if (litStart < n && raw[litStart] == '\r')
                    litStart++;
                if (litStart < n && raw[litStart] == '\n')
                    litStart++;
                size_t litLenSz = static_cast<size_t>(litLen < 0 ? 0 : litLen);
                std::string literalData = raw.substr(litStart, litLenSz);

                if (keyword.find("HEADER") != std::string::npos)
                    rec.rawHeaders = literalData;
                else if (keyword.find("TEXT") != std::string::npos)
                    rec.bodyText = literalData;

                cur = litStart + litLenSz;
                continue;
            }
            meta += c;
            cur++;
        }

        std::istringstream ms(meta);
        std::string tok;
        while (ms >> tok) {
            if (tok == "UID") {
                long v;
                if (ms >> v)
                    rec.uid = v;
            }
        }
        rec.seen = meta.find("\\Seen") != std::string::npos;

        out.push_back(rec);
        i = cur;
    }
    return out;
}

} // namespace email_backend
