#include "DockerJson.hpp"

#include <sstream>
#include <stdexcept>

namespace dockerterminal {

Json::Value parseJson(const std::string& text) {
    Json::Value out;
    Json::CharReaderBuilder b;
    std::string errs;
    std::istringstream in(text);
    if (!Json::parseFromStream(b, in, &out, &errs))
        throw std::runtime_error("invalid JSON from Docker API: " + errs);
    return out;
}

std::string jsonText(const Json::Value& v) {
    Json::StreamWriterBuilder b;
    b["indentation"] = "";
    return Json::writeString(b, v);
}

} // namespace dockerterminal
