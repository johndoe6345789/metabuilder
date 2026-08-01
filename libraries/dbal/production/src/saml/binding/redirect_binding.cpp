/**
 * @file redirect_binding.cpp
 */
#include "redirect_binding.hpp"
#include "base64_standard.hpp"

#include <zlib.h>
#include <stdexcept>
#include <vector>

namespace dbal::saml::binding {

std::string decodeRedirectBinding(const std::string& samlRequestParam) {
    std::vector<uint8_t> compressed = base64_decode(samlRequestParam);
    if (compressed.empty()) {
        throw std::runtime_error("SAMLRequest decoded to empty data");
    }

    z_stream strm{};
    // Negative window bits = raw DEFLATE, no zlib/gzip header — exactly what
    // the SAML HTTP-Redirect binding spec requires.
    if (inflateInit2(&strm, -15) != Z_OK) {
        throw std::runtime_error("inflateInit2 failed");
    }

    strm.next_in = compressed.data();
    strm.avail_in = static_cast<uInt>(compressed.size());

    std::string out;
    std::vector<uint8_t> buf(8192);
    int rc;
    // A malicious peer could otherwise force unbounded expansion (zip-bomb
    // style); cap at a size no legitimate AuthnRequest would ever approach.
    constexpr size_t kMaxOutputBytes = 1 * 1024 * 1024;
    do {
        strm.next_out = buf.data();
        strm.avail_out = static_cast<uInt>(buf.size());
        rc = inflate(&strm, Z_NO_FLUSH);
        if (rc != Z_OK && rc != Z_STREAM_END) {
            inflateEnd(&strm);
            throw std::runtime_error("SAMLRequest inflate failed");
        }
        size_t produced = buf.size() - strm.avail_out;
        if (out.size() + produced > kMaxOutputBytes) {
            inflateEnd(&strm);
            throw std::runtime_error("SAMLRequest inflated data exceeds size limit");
        }
        out.append(reinterpret_cast<char*>(buf.data()), produced);
    } while (rc != Z_STREAM_END);

    inflateEnd(&strm);
    return out;
}

} // namespace dbal::saml::binding
