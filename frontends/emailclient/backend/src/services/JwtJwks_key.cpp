#include "JwtJwks_key.hpp"

#include <jwt-cpp/base.h>
#include <openssl/core_names.h>
#include <openssl/param_build.h>
#include <openssl/pem.h>

#include <memory>

namespace email_backend {

namespace {

using BnPtr = std::unique_ptr<BIGNUM, decltype(&BN_free)>;
using BldPtr = std::unique_ptr<OSSL_PARAM_BLD, decltype(&OSSL_PARAM_BLD_free)>;
using ParamPtr = std::unique_ptr<OSSL_PARAM, decltype(&OSSL_PARAM_free)>;
using CtxPtr = std::unique_ptr<EVP_PKEY_CTX, decltype(&EVP_PKEY_CTX_free)>;
using PkeyPtr = std::unique_ptr<EVP_PKEY, decltype(&EVP_PKEY_free)>;
using BioPtr = std::unique_ptr<BIO, decltype(&BIO_free)>;

std::string base64UrlDecode(const std::string& s) {
    return jwt::base::decode<jwt::alphabet::base64url>(
        jwt::base::pad<jwt::alphabet::base64url>(s));
}

} // namespace

std::optional<std::string> rsaPemFromNE(const std::string& nB64Url,
                                         const std::string& eB64Url) {
    const std::string nBytes = base64UrlDecode(nB64Url);
    const std::string eBytes = base64UrlDecode(eB64Url);
    const auto* nData = reinterpret_cast<const unsigned char*>(nBytes.data());
    const auto* eData = reinterpret_cast<const unsigned char*>(eBytes.data());

    BnPtr n(BN_bin2bn(nData, static_cast<int>(nBytes.size()), nullptr),
            &BN_free);
    BnPtr e(BN_bin2bn(eData, static_cast<int>(eBytes.size()), nullptr),
            &BN_free);
    if (!n || !e)
        return std::nullopt;

    BldPtr bld(OSSL_PARAM_BLD_new(), &OSSL_PARAM_BLD_free);
    OSSL_PARAM_BLD_push_BN(bld.get(), OSSL_PKEY_PARAM_RSA_N, n.get());
    OSSL_PARAM_BLD_push_BN(bld.get(), OSSL_PKEY_PARAM_RSA_E, e.get());
    ParamPtr params(OSSL_PARAM_BLD_to_param(bld.get()), &OSSL_PARAM_free);

    CtxPtr ctx(EVP_PKEY_CTX_new_from_name(nullptr, "RSA", nullptr),
               &EVP_PKEY_CTX_free);
    if (!ctx || EVP_PKEY_fromdata_init(ctx.get()) <= 0)
        return std::nullopt;

    EVP_PKEY* rawPkey = nullptr;
    if (EVP_PKEY_fromdata(ctx.get(), &rawPkey, EVP_PKEY_PUBLIC_KEY,
                           params.get()) <= 0) {
        return std::nullopt;
    }
    PkeyPtr pkey(rawPkey, &EVP_PKEY_free);

    BioPtr bio(BIO_new(BIO_s_mem()), &BIO_free);
    if (!bio || PEM_write_bio_PUBKEY(bio.get(), pkey.get()) != 1)
        return std::nullopt;

    char* pemData = nullptr;
    const long pemLen = BIO_get_mem_data(bio.get(), &pemData);
    return std::string(pemData, static_cast<size_t>(pemLen));
}

} // namespace email_backend
