#include "Base64.hpp"

#include <jwt-cpp/base.h>

namespace pastebin {

std::string encodeBase64(const std::string& raw) {
    return jwt::base::encode<jwt::alphabet::base64>(raw);
}

std::optional<std::string> decodeBase64(const std::string& encoded) {
    try {
        return jwt::base::decode<jwt::alphabet::base64>(encoded);
    } catch (const std::exception&) {
        return std::nullopt;
    }
}

} // namespace pastebin
