/**
 * @file base64_standard.hpp
 * @brief Standard (RFC 4648 §4) base64 codec — with '+'/'/' and '=' padding.
 *
 * SAML bindings use standard base64, unlike the base64url codec elsewhere
 * in this codebase (JWT segments, JWKS n/e) — kept separate rather than
 * reusing dbal::security::base64url_* to avoid alphabet confusion bugs.
 */
#pragma once

#include <cstdint>
#include <stdexcept>
#include <string>
#include <vector>

namespace dbal::saml::binding {

inline std::string base64_encode(const uint8_t* data, size_t len) {
    static const char chars[] =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string out;
    out.reserve((len + 2) / 3 * 4);
    size_t i = 0;
    for (; i + 3 <= len; i += 3) {
        uint32_t n = (static_cast<uint32_t>(data[i]) << 16) |
                     (static_cast<uint32_t>(data[i + 1]) << 8) |
                     static_cast<uint32_t>(data[i + 2]);
        out += chars[(n >> 18) & 0x3F];
        out += chars[(n >> 12) & 0x3F];
        out += chars[(n >> 6) & 0x3F];
        out += chars[n & 0x3F];
    }
    if (len - i == 1) {
        uint32_t n = static_cast<uint32_t>(data[i]) << 16;
        out += chars[(n >> 18) & 0x3F];
        out += chars[(n >> 12) & 0x3F];
        out += "==";
    } else if (len - i == 2) {
        uint32_t n = (static_cast<uint32_t>(data[i]) << 16) | (static_cast<uint32_t>(data[i + 1]) << 8);
        out += chars[(n >> 18) & 0x3F];
        out += chars[(n >> 12) & 0x3F];
        out += chars[(n >> 6) & 0x3F];
        out += "=";
    }
    return out;
}

inline std::string base64_encode(const std::string& data) {
    return base64_encode(reinterpret_cast<const uint8_t*>(data.data()), data.size());
}

/// Decodes standard base64 (padding required, embedded whitespace tolerated —
/// SAML params sometimes arrive with URL-decoded newlines/spaces). Throws
/// std::runtime_error on any non-alphabet, non-whitespace character.
inline std::vector<uint8_t> base64_decode(const std::string& input) {
    auto charVal = [](unsigned char c) -> int {
        if (c >= 'A' && c <= 'Z') return c - 'A';
        if (c >= 'a' && c <= 'z') return c - 'a' + 26;
        if (c >= '0' && c <= '9') return c - '0' + 52;
        if (c == '+') return 62;
        if (c == '/') return 63;
        return -1;
    };

    std::vector<uint8_t> out;
    out.reserve(input.size() / 4 * 3 + 3);
    int val = 0, valb = -8;
    for (unsigned char c : input) {
        if (c == '=' ) break;
        if (c == '\r' || c == '\n' || c == ' ' || c == '\t') continue;
        int d = charVal(c);
        if (d < 0) {
            throw std::runtime_error("Invalid base64 character");
        }
        val = (val << 6) + d;
        valb += 6;
        if (valb >= 0) {
            out.push_back(static_cast<uint8_t>((val >> valb) & 0xFF));
            valb -= 8;
        }
    }
    return out;
}

} // namespace dbal::saml::binding
