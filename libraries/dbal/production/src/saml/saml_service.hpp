/**
 * @file saml_service.hpp
 * @brief Orchestrates SP-initiated SAML 2.0 SSO. Mirrors OidcService's
 *        role: HTTP handlers only translate request/response shape, all
 *        validation-order and security decisions live here.
 */
#pragma once

#include "metadata/sp_registry.hpp"
#include "state/saml_request_store.hpp"
#include "../oidc/crypto/rsa_keypair.hpp"
#include "dbal/core/client.hpp"
#include "dbal/core/errors.hpp"

#include <optional>
#include <string>

namespace dbal::saml {

struct IssuedSamlResponse {
    std::string acsUrl;
    std::string samlResponseBase64; ///< ready to place in the auto-submit form's SAMLResponse field
    std::optional<std::string> relayState;
};

class SamlService {
public:
    SamlService(dbal::Client& client, metadata::SpRegistry spRegistry,
                oidc::crypto::RsaKeypair keypair, std::string issuer);

    /// XML for the /saml/metadata endpoint (IdP entity descriptor).
    std::string metadataDocument() const;

    /**
     * @brief Decode+parse an incoming HTTP-Redirect-binding AuthnRequest,
     *        validate its Issuer against the SP registry, persist the
     *        pending state, and return the requestId to use as the /saml/login
     *        continuation token.
     */
    Result<std::string> handleSsoRequest(const std::string& samlRequestParam,
                                          const std::optional<std::string>& relayState);

    /// After successful login: issues the signed Response for the pending
    /// request, single-use (the pending state is consumed here).
    Result<IssuedSamlResponse> issueResponse(const std::string& requestId, const std::string& username);

private:
    dbal::Client& client_;
    metadata::SpRegistry sp_registry_;
    oidc::crypto::RsaKeypair keypair_;
    std::string issuer_;
    state::SamlRequestStore request_store_;
};

} // namespace dbal::saml
