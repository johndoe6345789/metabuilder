#include "util_address.hpp"

#include <cctype>
#include <sstream>

namespace email_backend {

std::vector<std::string> splitAddressList(const std::string& csv) {
    std::vector<std::string> out;
    std::stringstream ss(csv);
    std::string item;
    while (std::getline(ss, item, ',')) {
        const size_t a = item.find_first_not_of(" \t");
        if (a == std::string::npos)
            continue;
        const size_t b = item.find_last_not_of(" \t");
        out.push_back(item.substr(a, b - a + 1));
    }
    return out;
}

namespace {

bool iequalsPrefix(const std::string& line, const std::string& prefix) {
    if (line.size() < prefix.size())
        return false;
    for (size_t i = 0; i < prefix.size(); ++i) {
        const auto a = static_cast<unsigned char>(line[i]);
        const auto b = static_cast<unsigned char>(prefix[i]);
        if (std::tolower(a) != std::tolower(b))
            return false;
    }
    return true;
}

} // namespace

std::string extractHeader(const std::string& rawHeaders,
                           const std::string& name) {
    std::istringstream in(rawHeaders);
    std::string line;
    std::string value;
    bool capturing = false;
    const std::string prefix = name + ":";

    while (std::getline(in, line)) {
        if (!line.empty() && line.back() == '\r')
            line.pop_back();

        if (capturing && !line.empty() &&
            (line[0] == ' ' || line[0] == '\t')) {
            const size_t start = line.find_first_not_of(" \t");
            if (start != std::string::npos) {
                value += ' ';
                value += line.substr(start);
            }
            continue;
        }
        capturing = false;

        if (iequalsPrefix(line, prefix)) {
            const size_t start = line.find_first_not_of(" \t", prefix.size());
            value = start == std::string::npos ? "" : line.substr(start);
            capturing = true;
        }
    }
    return value;
}

} // namespace email_backend
