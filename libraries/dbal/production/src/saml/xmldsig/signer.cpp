/**
 * @file signer.cpp
 */
#include "signer.hpp"
#include "xmlsec_context.hpp"

#include <xmlsec/templates.h>
#include <xmlsec/xmldsig.h>
#include <xmlsec/xmltree.h>
#include <xmlsec/crypto.h>
#include <xmlsec/openssl/app.h>
#include <xmlsec/openssl/crypto.h>

#include <stdexcept>

namespace dbal::saml::xmldsig {

void signElement(xmlDocPtr doc, xmlNodePtr elementToSign, xmlNodePtr insertAfter,
                  const std::string& id, const std::string& privateKeyPem) {
    ensureXmlSecInitialized();

    std::string uri = "#" + id;

    xmlNodePtr signNode = xmlSecTmplSignatureCreate(
        doc, xmlSecTransformExclC14NId, xmlSecTransformRsaSha256Id, nullptr);
    if (!signNode) {
        throw std::runtime_error("xmlSecTmplSignatureCreate failed");
    }
    // SAML convention: <ds:Signature> is the sibling immediately after <Issuer>.
    xmlAddNextSibling(insertAfter, signNode);

    xmlNodePtr refNode = xmlSecTmplSignatureAddReference(
        signNode, xmlSecTransformSha256Id, nullptr,
        reinterpret_cast<const xmlChar*>(uri.c_str()), nullptr);
    if (!refNode) {
        throw std::runtime_error("xmlSecTmplSignatureAddReference failed");
    }
    if (!xmlSecTmplReferenceAddTransform(refNode, xmlSecTransformEnvelopedId)) {
        throw std::runtime_error("Failed to add enveloped-signature transform");
    }
    if (!xmlSecTmplReferenceAddTransform(refNode, xmlSecTransformExclC14NId)) {
        throw std::runtime_error("Failed to add exclusive-c14n reference transform");
    }

    xmlNodePtr keyInfoNode = xmlSecTmplSignatureEnsureKeyInfo(signNode, nullptr);
    if (!keyInfoNode || !xmlSecTmplKeyInfoAddKeyValue(keyInfoNode)) {
        throw std::runtime_error("Failed to add KeyValue to KeyInfo");
    }

    // Required for xmlsec to resolve the "#id" reference URI back to
    // elementToSign at all — without this, digest computation over the
    // reference fails during signing, not just during later verification.
    const xmlChar* idNames[] = {reinterpret_cast<const xmlChar*>("ID"), nullptr};
    xmlSecAddIDs(doc, xmlDocGetRootElement(doc), idNames);

    xmlSecDSigCtxPtr dsigCtx = xmlSecDSigCtxCreate(nullptr);
    if (!dsigCtx) {
        throw std::runtime_error("xmlSecDSigCtxCreate failed");
    }

    xmlSecKeyPtr key = xmlSecOpenSSLAppKeyLoadMemory(
        reinterpret_cast<const xmlSecByte*>(privateKeyPem.data()), privateKeyPem.size(),
        xmlSecKeyDataFormatPem, nullptr, nullptr, nullptr);
    if (!key) {
        xmlSecDSigCtxDestroy(dsigCtx);
        throw std::runtime_error("Failed to load private key for signing");
    }
    // dsigCtx takes ownership of signKey (freed by xmlSecDSigCtxDestroy below) —
    // this mirrors xmlsec1's own sign1.c example.
    dsigCtx->signKey = key;

    int rc = xmlSecDSigCtxSign(dsigCtx, signNode);
    xmlSecDSigCtxDestroy(dsigCtx);

    if (rc < 0) {
        throw std::runtime_error("xmlSecDSigCtxSign failed");
    }
}

} // namespace dbal::saml::xmldsig
