/**
 * @file signer.hpp
 * @brief Signs a SAML element in place with an enveloped XML-DSig signature.
 *
 * Algorithms are hard-pinned, never read from caller input: Exclusive C14N
 * for both the SignedInfo canonicalization and the reference transform,
 * RSA-SHA256 for the signature, SHA-256 for the digest, plus the standard
 * enveloped-signature reference transform. This matches the plan's
 * "hard-pin on both sign and verify" requirement — there is no parameter
 * to select a different algorithm.
 */
#pragma once

#include <libxml/tree.h>
#include <string>

namespace dbal::saml::xmldsig {

/**
 * @brief Builds a <ds:Signature> covering @p elementToSign (referenced by
 *        its own "ID" attribute, which must already be set) and inserts it
 *        as the next sibling of @p insertAfter (SAML convention: right
 *        after <Issuer>), then signs it with @p privateKeyPem.
 *
 * @param doc            Owning document of elementToSign.
 * @param elementToSign   The element whose "ID" attribute is the reference target.
 * @param insertAfter     Node the <ds:Signature> is inserted immediately after (e.g. <Issuer>).
 * @param id              Value of elementToSign's "ID" attribute (without the leading '#').
 * @param privateKeyPem   PEM-encoded RSA private key.
 * @throws std::runtime_error on any xmlsec/OpenSSL failure.
 */
void signElement(xmlDocPtr doc, xmlNodePtr elementToSign, xmlNodePtr insertAfter,
                  const std::string& id, const std::string& privateKeyPem);

} // namespace dbal::saml::xmldsig
