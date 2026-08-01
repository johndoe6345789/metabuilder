/**
 * @file redirect_binding.hpp
 * @brief SAML HTTP-Redirect binding decode (incoming AuthnRequest only).
 *
 * Per the SAML 2.0 bindings spec §3.4.4.1: base64-decode the SAMLRequest
 * query parameter, then raw DEFLATE-inflate it (no zlib/gzip header —
 * negative window bits).
 */
#pragma once

#include <string>

namespace dbal::saml::binding {

/**
 * @brief Decodes a base64+raw-DEFLATE SAMLRequest query parameter value
 *        back into the original XML bytes.
 * @throws std::runtime_error on malformed base64 or inflate failure —
 *         callers should treat this the same as any other malformed request.
 */
std::string decodeRedirectBinding(const std::string& samlRequestParam);

} // namespace dbal::saml::binding
