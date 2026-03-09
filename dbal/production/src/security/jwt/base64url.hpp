/**
 * @file base64url.hpp
 * @brief Base64url decode utilities for JWT validation
 */
#pragma once

#include <string>
#include <vector>
#include <cstdint>

namespace dbal::security {

/**
 * @brief Decode a base64url-encoded string to raw bytes.
 * Handles missing padding and the - / _ character substitutions.
 */
inline std::vector<uint8_t> base64url_decode(const std::string& input) {
    // Convert base64url → standard base64 and add padding
    std::string s = input;
    for (char& c : s) {
        if (c == '-') c = '+';
        else if (c == '_') c = '/';
    }
    while (s.size() % 4 != 0) s += '=';

    static const std::string b64chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    std::vector<uint8_t> result;
    result.reserve(s.size() * 3 / 4);

    int val = 0, valb = -8;
    for (unsigned char c : s) {
        if (c == '=') break;
        auto pos = b64chars.find(static_cast<char>(c));
        if (pos == std::string::npos) continue;
        val = (val << 6) + static_cast<int>(pos);
        valb += 6;
        if (valb >= 0) {
            result.push_back(static_cast<uint8_t>((val >> valb) & 0xFF));
            valb -= 8;
        }
    }
    return result;
}

/**
 * @brief Decode a base64url-encoded string and return as lowercase hex.
 * Used to compare JWT signatures against hmac_sha256() output.
 */
inline std::string base64url_to_hex(const std::string& b64url) {
    auto bytes = base64url_decode(b64url);
    static const char hex_chars[] = "0123456789abcdef";
    std::string hex;
    hex.reserve(bytes.size() * 2);
    for (uint8_t b : bytes) {
        hex += hex_chars[(b >> 4) & 0x0F];
        hex += hex_chars[b & 0x0F];
    }
    return hex;
}

} // namespace dbal::security
