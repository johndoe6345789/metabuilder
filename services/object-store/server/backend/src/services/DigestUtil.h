/**
 * @file DigestUtil.h
 * @brief MD5 digest helper using OpenSSL 3.x EVP API.
 */

#pragma once

#include <openssl/evp.h>

#include <iomanip>
#include <sstream>
#include <string>

namespace s3
{

/// @brief Compute MD5 hex digest of data (accepts string_view to avoid copies).
inline std::string md5hex(std::string_view data)
{
    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int len = 0;
    auto* ctx = EVP_MD_CTX_new();
    EVP_DigestInit_ex(ctx, EVP_md5(), nullptr);
    EVP_DigestUpdate(ctx, data.data(), data.size());
    EVP_DigestFinal_ex(ctx, hash, &len);
    EVP_MD_CTX_free(ctx);
    std::ostringstream ss;
    for (unsigned int i = 0; i < len; ++i)
        ss << std::hex << std::setfill('0')
           << std::setw(2) << (int)hash[i];
    return ss.str();
}

} // namespace s3
