/**
 * @file xmlsec_context.hpp
 * @brief Process-wide libxml2 + xmlsec1 initialization, done exactly once.
 *
 * xmlsec1 (like libxml2 itself) has global, process-wide init/shutdown
 * calls that are not meant to be repeated per-request or per-thread. This
 * is called once from SamlService's constructor; a static local in
 * ensureInitialized() gives the once-only guarantee without adding a
 * separate explicit init step server startup has to remember to call.
 */
#pragma once

namespace dbal::saml::xmldsig {

/// Initializes libxml2 + xmlsec1 + xmlsec1-openssl on first call; a no-op
/// thereafter. Throws std::runtime_error if any init step fails.
void ensureXmlSecInitialized();

} // namespace dbal::saml::xmldsig
