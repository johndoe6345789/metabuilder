#include "util_imap_list.hpp"

#include <sstream>

namespace email_backend {

namespace {

std::string readToken(std::string& rest) {
    if (rest.empty())
        return "";
    std::string tok;
    if (rest[0] == '"') {
        const size_t end = rest.find('"', 1);
        if (end == std::string::npos) {
            tok = rest.substr(1);
            rest.clear();
            return tok;
        }
        tok = rest.substr(1, end - 1);
        rest = rest.substr(end + 1);
    } else {
        const size_t end = rest.find(' ');
        tok = end == std::string::npos ? rest : rest.substr(0, end);
        rest = end == std::string::npos ? "" : rest.substr(end + 1);
    }
    const size_t j = rest.find_first_not_of(' ');
    rest = j == std::string::npos ? "" : rest.substr(j);
    return tok;
}

} // namespace

std::optional<ImapListEntry> parseImapListLine(const std::string& lineIn) {
    std::string line = lineIn;
    while (!line.empty() && (line.back() == '\r' || line.back() == '\n'))
        line.pop_back();

    const size_t listPos = line.find(" LIST ");
    if (listPos == std::string::npos)
        return std::nullopt;

    const size_t p1 = line.find('(', listPos);
    if (p1 == std::string::npos)
        return std::nullopt;
    const size_t p2 = line.find(')', p1);
    if (p2 == std::string::npos)
        return std::nullopt;

    ImapListEntry entry;
    std::istringstream flagsStream(line.substr(p1 + 1, p2 - p1 - 1));
    std::string flag;
    while (flagsStream >> flag)
        entry.flags.push_back(flag);

    std::string rest = line.substr(p2 + 1);
    const size_t i = rest.find_first_not_of(' ');
    rest = i == std::string::npos ? "" : rest.substr(i);

    entry.delimiter = readToken(rest);
    if (entry.delimiter == "NIL")
        entry.delimiter = "";
    entry.name = readToken(rest);
    if (entry.name.empty())
        return std::nullopt;
    return entry;
}

} // namespace email_backend
