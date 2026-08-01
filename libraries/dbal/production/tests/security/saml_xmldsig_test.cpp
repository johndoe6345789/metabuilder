/**
 * @file saml_xmldsig_test.cpp
 * @brief Phase 6 gate: enveloped XML-DSig sign->verify round trip, plus the
 *        adversarial cases the plan's SAML security checklist calls out —
 *        tampered content, tampered/missing signature, wrong key, and
 *        duplicate-ID (XML Signature Wrapping) rejection.
 */

#include <gtest/gtest.h>
#include <libxml/tree.h>
#include <libxml/parser.h>
#include <filesystem>
#include <string>

#include "oidc/crypto/rsa_keypair.hpp"
#include "saml/xmldsig/signer.hpp"
#include "saml/xmldsig/verifier.hpp"

using dbal::oidc::crypto::RsaKeypair;
using dbal::saml::xmldsig::signElement;
using dbal::saml::xmldsig::verifySignedElement;

namespace {

std::string tempKeyPath(const char* name) {
    return (std::filesystem::temp_directory_path() / name).string();
}

// Builds a minimal SAML-Response-shaped document:
// <Response ID="resp1" xmlns="urn:test">
//   <Issuer>test-issuer</Issuer>
//   <Status>ok</Status>
// </Response>
// Caller owns the returned doc (xmlFreeDoc).
xmlDocPtr buildTestDoc(xmlNodePtr* outRoot, xmlNodePtr* outIssuer) {
    xmlDocPtr doc = xmlNewDoc(reinterpret_cast<const xmlChar*>("1.0"));
    xmlNodePtr root = xmlNewNode(nullptr, reinterpret_cast<const xmlChar*>("Response"));
    xmlNewNs(root, reinterpret_cast<const xmlChar*>("urn:test"), nullptr);
    xmlNewProp(root, reinterpret_cast<const xmlChar*>("ID"), reinterpret_cast<const xmlChar*>("resp1"));
    xmlDocSetRootElement(doc, root);

    xmlNodePtr issuer = xmlNewChild(root, nullptr,
        reinterpret_cast<const xmlChar*>("Issuer"),
        reinterpret_cast<const xmlChar*>("test-issuer"));
    xmlNewChild(root, nullptr,
        reinterpret_cast<const xmlChar*>("Status"),
        reinterpret_cast<const xmlChar*>("ok"));

    *outRoot = root;
    *outIssuer = issuer;
    return doc;
}

} // namespace

TEST(SamlXmlDsig, SignThenVerifySucceeds) {
    auto path = tempKeyPath("dbal_test_saml_xmldsig_1.pem");
    std::filesystem::remove(path);
    RsaKeypair kp(path);

    xmlNodePtr root, issuer;
    xmlDocPtr doc = buildTestDoc(&root, &issuer);

    ASSERT_NO_THROW(signElement(doc, root, issuer, "resp1", kp.privateKeyPem()));
    EXPECT_TRUE(verifySignedElement(doc, root, "resp1", kp.publicKeyPem()));

    xmlFreeDoc(doc);
    std::filesystem::remove(path);
}

TEST(SamlXmlDsig, TamperedContentFailsVerification) {
    auto path = tempKeyPath("dbal_test_saml_xmldsig_2.pem");
    std::filesystem::remove(path);
    RsaKeypair kp(path);

    xmlNodePtr root, issuer;
    xmlDocPtr doc = buildTestDoc(&root, &issuer);
    signElement(doc, root, issuer, "resp1", kp.privateKeyPem());

    // Tamper with the Status content after signing.
    xmlNodePtr status = issuer->next->next; // Issuer -> Signature -> Status
    ASSERT_STREQ(reinterpret_cast<const char*>(status->name), "Status");
    xmlNodeSetContent(status, reinterpret_cast<const xmlChar*>("tampered"));

    EXPECT_FALSE(verifySignedElement(doc, root, "resp1", kp.publicKeyPem()));

    xmlFreeDoc(doc);
    std::filesystem::remove(path);
}

TEST(SamlXmlDsig, WrongPublicKeyFailsVerification) {
    auto path = tempKeyPath("dbal_test_saml_xmldsig_3.pem");
    auto otherPath = tempKeyPath("dbal_test_saml_xmldsig_3_other.pem");
    std::filesystem::remove(path);
    std::filesystem::remove(otherPath);
    RsaKeypair kp(path);
    RsaKeypair other(otherPath);

    xmlNodePtr root, issuer;
    xmlDocPtr doc = buildTestDoc(&root, &issuer);
    signElement(doc, root, issuer, "resp1", kp.privateKeyPem());

    EXPECT_FALSE(verifySignedElement(doc, root, "resp1", other.publicKeyPem()));

    xmlFreeDoc(doc);
    std::filesystem::remove(path);
    std::filesystem::remove(otherPath);
}

TEST(SamlXmlDsig, MissingSignatureFailsVerification) {
    xmlNodePtr root, issuer;
    xmlDocPtr doc = buildTestDoc(&root, &issuer);

    // Never signed at all.
    EXPECT_FALSE(verifySignedElement(doc, root, "resp1", "not-a-real-key"));

    xmlFreeDoc(doc);
}

TEST(SamlXmlDsig, DuplicateIdAttributeRejectsAsWrappingAttempt) {
    auto path = tempKeyPath("dbal_test_saml_xmldsig_4.pem");
    std::filesystem::remove(path);
    RsaKeypair kp(path);

    xmlNodePtr root, issuer;
    xmlDocPtr doc = buildTestDoc(&root, &issuer);
    signElement(doc, root, issuer, "resp1", kp.privateKeyPem());

    // Simulate an XML Signature Wrapping attempt: inject a second element
    // elsewhere in the document carrying the SAME ID value as the
    // legitimately-signed element.
    xmlNodePtr decoy = xmlNewNode(nullptr, reinterpret_cast<const xmlChar*>("Decoy"));
    xmlNewProp(decoy, reinterpret_cast<const xmlChar*>("ID"), reinterpret_cast<const xmlChar*>("resp1"));
    xmlAddChild(xmlDocGetRootElement(doc), decoy);

    EXPECT_FALSE(verifySignedElement(doc, root, "resp1", kp.publicKeyPem()));

    xmlFreeDoc(doc);
    std::filesystem::remove(path);
}

TEST(SamlXmlDsig, WrongExpectedIdFailsVerification) {
    auto path = tempKeyPath("dbal_test_saml_xmldsig_5.pem");
    std::filesystem::remove(path);
    RsaKeypair kp(path);

    xmlNodePtr root, issuer;
    xmlDocPtr doc = buildTestDoc(&root, &issuer);
    signElement(doc, root, issuer, "resp1", kp.privateKeyPem());

    // Caller asks to verify against a different expected ID than what was signed.
    EXPECT_FALSE(verifySignedElement(doc, root, "some-other-id", kp.publicKeyPem()));

    xmlFreeDoc(doc);
    std::filesystem::remove(path);
}
