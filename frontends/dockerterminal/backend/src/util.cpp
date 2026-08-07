#include "util.hpp"

#include <cstdlib>

namespace dockerterminal {

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

std::vector<std::string> splitCommand(const std::string& command) {
    std::vector<std::string> out;
    std::string cur;
    bool inToken = false;
    char quote = '\0';

    for (size_t i = 0; i < command.size(); ++i) {
        char c = command[i];
        if (quote != '\0') {
            if (c == quote) {
                quote = '\0';
            } else {
                cur += c;
            }
            continue;
        }
        if (c == '\'' || c == '"') {
            quote = c;
            inToken = true;
            continue;
        }
        if (c == ' ' || c == '\t') {
            if (inToken) {
                out.push_back(cur);
                cur.clear();
                inToken = false;
            }
            continue;
        }
        cur += c;
        inToken = true;
    }
    if (inToken)
        out.push_back(cur);
    return out;
}

std::string formatUptime(int64_t createdEpochSeconds, int64_t nowEpochSeconds) {
    int64_t deltaSeconds = nowEpochSeconds - createdEpochSeconds;
    if (deltaSeconds < 0)
        deltaSeconds = 0;

    int64_t days = deltaSeconds / 86400;
    int64_t hours = (deltaSeconds % 86400) / 3600;
    int64_t minutes = (deltaSeconds % 3600) / 60;

    if (days > 0)
        return std::to_string(days) + "d " + std::to_string(hours) + "h";
    if (hours > 0)
        return std::to_string(hours) + "h " + std::to_string(minutes) + "m";
    return std::to_string(minutes) + "m";
}

} // namespace dockerterminal
