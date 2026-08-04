#include "util.hpp"

#include <chrono>
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <sstream>
#include <stdexcept>

namespace codegen_backend {

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

Json::Value parseJson(const std::string& text) {
    Json::Value out;
    Json::CharReaderBuilder b;
    std::string errs;
    std::istringstream in(text);
    if (!Json::parseFromStream(b, in, &out, &errs))
        throw std::runtime_error(errs);
    return out;
}

std::string jsonText(const Json::Value& v) {
    Json::StreamWriterBuilder b;
    b["indentation"] = "";
    return Json::writeString(b, v);
}

std::string readFile(const std::filesystem::path& p) {
    std::ifstream in(p);
    if (!in)
        throw std::runtime_error("failed to read " + p.string());
    std::ostringstream ss;
    ss << in.rdbuf();
    return ss.str();
}

std::vector<std::string> sqlStatements(const std::string& sql) {
    std::vector<std::string> out;
    std::string cur;
    bool single = false;
    for (char c : sql) {
        if (c == '\'')
            single = !single;
        if (c == ';' && !single) {
            if (cur.find_first_not_of(" \n\r\t") != std::string::npos)
                out.push_back(cur);
            cur.clear();
            continue;
        }
        cur += c;
    }
    if (cur.find_first_not_of(" \n\r\t") != std::string::npos)
        out.push_back(cur);
    return out;
}

} // namespace codegen_backend
