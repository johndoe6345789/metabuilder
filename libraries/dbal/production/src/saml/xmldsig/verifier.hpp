/**
 * @file verifier.hpp
 * @brief Verifies an enveloped XML-DSig signature on a SAML element,
 *        hardened against XML Signature Wrapping (XSW) and algorithm
 *        confusion.
 *
 * Defenses, matching the plan's security checklist:
 *  - The whole document is scanned for duplicate "ID" attribute values
 *    before anything else runs; any duplicate rejects the document
 *    outright (a hallmark of ID-based wrapping attacks).
 *  - Only the one expected ID is ever registered with libxml2's ID table
 *    (xmlAddID) — reference-URI resolution can only ever land on that
 *    single, known element, never re-derived by tag name or XPath.
 *  - The <ds:Signature> must be a *direct child* of the signed element,
 *    and there must be exactly one of them and exactly one <ds:Reference>
 *    inside it, pointed at exactly "#" + expectedId.
 *  - Signature/canonicalization/digest algorithms are hard-pinned to
 *    RSA-SHA256 + Exclusive C14N + SHA-256 on the verify side too — any
 *    other algorithm URI in the attacker-controlled XML is rejected
 *    rather than honored.
 *  - The verification key is always the caller-supplied trusted PEM;
 *    any KeyInfo/KeyValue embedded in the (attacker-controlled) document
 *    is never trusted or consulted.
 */
#pragma once

#include <libxml/tree.h>
#include <string>

namespace dbal::saml::xmldsig {

/**
 * @brief Verify that @p elementNode carries a valid enveloped signature
 *        over itself, referencing "#" + @p expectedId, signed by the key
 *        matching @p publicKeyPem.
 * @return true only if every structural and cryptographic check passes.
 *         Never throws — any failure (structural or cryptographic) is
 *         reported via the return value plus a logged reason, so callers
 *         can treat every failure mode uniformly as "reject this request".
 */
bool verifySignedElement(xmlDocPtr doc, xmlNodePtr elementNode,
                          const std::string& expectedId, const std::string& publicKeyPem);

} // namespace dbal::saml::xmldsig
