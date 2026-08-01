/**
 * @file verifier.cpp
 */
#include "verifier.hpp"
#include "xmlsec_context.hpp"

#include <xmlsec/xmldsig.h>
#include <xmlsec/xmltree.h>
#include <xmlsec/crypto.h>
#include <xmlsec/openssl/app.h>
#include <xmlsec/openssl/crypto.h>

#include <spdlog/spdlog.h>
#include <map>
#include <string>

namespace dbal::saml::xmldsig {

namespace {

// Recursively collects every "ID" attribute value found anywhere in the
// document; returns false the moment a duplicate value is found. This runs
// BEFORE any ID is registered with libxml2's ID table, so it can't be
// bypassed by an attacker crafting two elements with the same ID (the
// classic XSW setup: a legitimately-signed element plus a
// forged/duplicate-ID decoy the application would otherwise read from).
bool hasDuplicateIdAttribute(xmlNodePtr node, std::map<std::string, xmlNodePtr>& seen) {
    for (xmlNodePtr cur = node; cur; cur = cur->next) {
        if (cur->type == XML_ELEMENT_NODE) {
            xmlChar* idVal = xmlGetProp(cur, reinterpret_cast<const xmlChar*>("ID"));
            if (idVal) {
                std::string value(reinterpret_cast<const char*>(idVal));
                xmlFree(idVal);
                auto [it, inserted] = seen.emplace(value, cur);
                if (!inserted) {
                    spdlog::warn("[saml] Duplicate ID attribute value '{}' found in document — rejecting", value);
                    return true;
                }
            }
            if (hasDuplicateIdAttribute(cur->children, seen)) {
                return true;
            }
        }
    }
    return false;
}

// Counts direct-child elements matching (name, ns) — used to reject
// anything other than exactly one <ds:Signature> under the signed element,
// and exactly one <ds:Reference> under its <ds:SignedInfo>.
int countDirectChildren(xmlNodePtr parent, const xmlChar* name, const xmlChar* ns) {
    int count = 0;
    for (xmlNodePtr cur = parent->children; cur; cur = cur->next) {
        if (cur->type != XML_ELEMENT_NODE) continue;
        if (xmlStrEqual(cur->name, name) &&
            cur->ns && xmlStrEqual(cur->ns->href, ns)) {
            ++count;
        }
    }
    return count;
}

xmlNodePtr findSingleDirectChild(xmlNodePtr parent, const xmlChar* name, const xmlChar* ns) {
    for (xmlNodePtr cur = parent->children; cur; cur = cur->next) {
        if (cur->type != XML_ELEMENT_NODE) continue;
        if (xmlStrEqual(cur->name, name) &&
            cur->ns && xmlStrEqual(cur->ns->href, ns)) {
            return cur;
        }
    }
    return nullptr;
}

} // namespace

bool verifySignedElement(xmlDocPtr doc, xmlNodePtr elementNode,
                          const std::string& expectedId, const std::string& publicKeyPem) {
    ensureXmlSecInitialized();

    if (xmlGetIntSubset(doc) != nullptr) {
        spdlog::warn("[saml] Document has a DOCTYPE — rejecting (SAML XML never legitimately has one)");
        return false;
    }

    // 1. Reject any duplicate "ID" attribute anywhere in the document.
    std::map<std::string, xmlNodePtr> seenIds;
    if (hasDuplicateIdAttribute(xmlDocGetRootElement(doc), seenIds)) {
        return false;
    }

    // 2. The element's own ID attribute must exist and match expectedId exactly.
    xmlAttrPtr idAttr = xmlHasProp(elementNode, reinterpret_cast<const xmlChar*>("ID"));
    if (!idAttr) {
        spdlog::warn("[saml] Signed element has no ID attribute");
        return false;
    }
    xmlChar* idValRaw = xmlNodeListGetString(doc, idAttr->children, 1);
    std::string idVal = idValRaw ? reinterpret_cast<const char*>(idValRaw) : "";
    if (idValRaw) xmlFree(idValRaw);
    if (idVal != expectedId) {
        spdlog::warn("[saml] Signed element ID '{}' does not match expected '{}'", idVal, expectedId);
        return false;
    }

    // 3. <ds:Signature> must be a direct child of the signed element, and there
    //    must be exactly one — never resolved by searching the whole document.
    if (countDirectChildren(elementNode, xmlSecNodeSignature, xmlSecDSigNs) != 1) {
        spdlog::warn("[saml] Expected exactly one direct-child <ds:Signature>, found a different count");
        return false;
    }
    xmlNodePtr signatureNode = findSingleDirectChild(elementNode, xmlSecNodeSignature, xmlSecDSigNs);
    if (!signatureNode) {
        return false;
    }

    // 4. Exactly one <ds:Reference> inside <ds:SignedInfo>, and its URI must be
    //    exactly "#" + expectedId — no room for a reference pointed elsewhere.
    xmlNodePtr signedInfoNode = findSingleDirectChild(
        signatureNode, reinterpret_cast<const xmlChar*>("SignedInfo"), xmlSecDSigNs);
    if (!signedInfoNode ||
        countDirectChildren(signedInfoNode, xmlSecNodeReference, xmlSecDSigNs) != 1) {
        spdlog::warn("[saml] Expected exactly one <ds:Reference>, found a different count");
        return false;
    }
    xmlNodePtr referenceNode = findSingleDirectChild(
        signedInfoNode, xmlSecNodeReference, xmlSecDSigNs);
    xmlChar* refUriRaw = xmlGetProp(referenceNode, reinterpret_cast<const xmlChar*>("URI"));
    std::string refUri = refUriRaw ? reinterpret_cast<const char*>(refUriRaw) : "";
    if (refUriRaw) xmlFree(refUriRaw);
    std::string expectedUri = "#" + expectedId;
    if (refUri != expectedUri) {
        spdlog::warn("[saml] Reference URI '{}' does not match expected '{}'", refUri, expectedUri);
        return false;
    }

    // 5. Register "ID" attributes with libxml2's ID table via xmlsec's own
    //    helper (required for xmlsec's XPointer-based "#id" reference
    //    resolution to find anything at all) — safe here because step 1
    //    already rejected the document outright if any duplicate ID value
    //    existed anywhere in it.
    const xmlChar* idNames[] = {reinterpret_cast<const xmlChar*>("ID"), nullptr};
    xmlSecAddIDs(doc, xmlDocGetRootElement(doc), idNames);

    xmlSecDSigCtxPtr dsigCtx = xmlSecDSigCtxCreate(nullptr);
    if (!dsigCtx) {
        spdlog::error("[saml] xmlSecDSigCtxCreate failed");
        return false;
    }

    // Hard-pin allowed algorithms — anything else in the (attacker-controlled)
    // XML is rejected rather than honored. Without this, xmlsec accepts any
    // registered transform by default.
    xmlSecDSigCtxEnableReferenceTransform(dsigCtx, xmlSecTransformEnvelopedId);
    xmlSecDSigCtxEnableReferenceTransform(dsigCtx, xmlSecTransformExclC14NId);
    xmlSecDSigCtxEnableReferenceTransform(dsigCtx, xmlSecTransformSha256Id);
    xmlSecDSigCtxEnableSignatureTransform(dsigCtx, xmlSecTransformExclC14NId);
    xmlSecDSigCtxEnableSignatureTransform(dsigCtx, xmlSecTransformRsaSha256Id);

    xmlSecKeyPtr key = xmlSecOpenSSLAppKeyLoadMemory(
        reinterpret_cast<const xmlSecByte*>(publicKeyPem.data()), publicKeyPem.size(),
        xmlSecKeyDataFormatPem, nullptr, nullptr, nullptr);
    if (!key) {
        spdlog::error("[saml] Failed to load public key for verification");
        xmlSecDSigCtxDestroy(dsigCtx);
        return false;
    }
    // dsigCtx takes ownership of signKey, freed by xmlSecDSigCtxDestroy below.
    // Only this explicitly-supplied trusted key is ever used — any
    // <ds:KeyInfo>/<ds:KeyValue> embedded in the untrusted document is
    // never consulted (keysMngr is NULL, and signKey is pre-set).
    dsigCtx->signKey = key;

    int rc = xmlSecDSigCtxVerify(dsigCtx, signatureNode);
    bool ok = rc >= 0 && dsigCtx->status == xmlSecDSigStatusSucceeded;

    // Defense-in-depth: re-confirm the algorithms actually used, even though
    // EnableReferenceTransform/EnableSignatureTransform above already
    // restrict what xmlsec would accept.
    if (ok) {
        if (!dsigCtx->signMethod || dsigCtx->signMethod->id != xmlSecTransformRsaSha256Id ||
            !dsigCtx->c14nMethod || dsigCtx->c14nMethod->id != xmlSecTransformExclC14NId) {
            spdlog::warn("[saml] Signature verified but used an unexpected algorithm — rejecting");
            ok = false;
        }
    }

    xmlSecDSigCtxDestroy(dsigCtx);

    if (!ok) {
        spdlog::warn("[saml] Signature verification failed for element with ID '{}'", expectedId);
    }
    return ok;
}

} // namespace dbal::saml::xmldsig
