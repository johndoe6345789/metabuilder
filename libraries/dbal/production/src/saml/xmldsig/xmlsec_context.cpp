/**
 * @file xmlsec_context.cpp
 */
#include "xmlsec_context.hpp"

#include <libxml/parser.h>
#include <libxml/tree.h>
#include <xmlsec/xmlsec.h>
#include <xmlsec/crypto.h>
#include <xmlsec/errors.h>

#include <spdlog/spdlog.h>
#include <stdexcept>

namespace dbal::saml::xmldsig {

namespace {

// Belt-and-suspenders XXE defense: even though every parse call site in
// this module also passes XML_PARSE_NONET and never passes XML_PARSE_NOENT
// or XML_PARSE_DTDLOAD (the actual gate — see authn_request_parser.cpp),
// this makes any external entity reference fail closed process-wide rather
// than relying solely on parser flags being right at every call site.
xmlParserInputPtr refuseExternalEntity(const char* url, const char* id, xmlParserCtxtPtr) {
    spdlog::warn("[saml] Refused external entity load (URL={}, ID={})",
                 url ? url : "(null)", id ? id : "(null)");
    return nullptr;
}

void initOnce() {
    xmlInitParser();
    xmlSetExternalEntityLoader(refuseExternalEntity);

    if (xmlSecInit() < 0) {
        throw std::runtime_error("xmlSecInit failed");
    }
    if (xmlSecCryptoAppInit(nullptr) < 0) {
        throw std::runtime_error("xmlSecCryptoAppInit failed");
    }
    if (xmlSecCryptoInit() < 0) {
        throw std::runtime_error("xmlSecCryptoInit failed");
    }
    spdlog::info("[saml] xmlsec1 + libxml2 initialized (OpenSSL crypto backend)");
}

} // namespace

void ensureXmlSecInitialized() {
    static bool initialized = [] {
        initOnce();
        return true;
    }();
    (void)initialized;
}

} // namespace dbal::saml::xmldsig
