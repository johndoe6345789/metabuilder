/**
 * @file client_secret_ops.cpp
 * @brief DBAL Client operations for reversible secret storage
 *        (EncryptedSecret) -- see security/crypto/reversible_crypto.hpp
 *        and daemon/handlers/admin/encrypted_secret_admin_route_handler.hpp
 *        for the only HTTP surface that reaches these.
 */
#include "dbal/client.hpp"
#include "security/crypto/reversible_crypto.hpp"

namespace dbal {

Result<std::string> Client::createEncryptedSecret(const std::string& tenantId,
                                                    const std::string& plaintext) {
    if (plaintext.empty()) {
        return Error::validationError("plaintext is required");
    }

    Json data;
    try {
        const auto sealed = dbal::security::seal_secret(plaintext);
        data["ciphertext"] = sealed.ciphertext;
        data["nonce"] = sealed.nonce;
    } catch (const std::exception& e) {
        return Error::internal(std::string("encryption failed: ") + e.what());
    }
    if (!tenantId.empty()) {
        data["tenantId"] = tenantId;
    }

    auto result = adapter_->create("EncryptedSecret", data);
    if (result.isError()) {
        return result.error();
    }
    return result.value().value("id", std::string());
}

Result<std::string> Client::revealEncryptedSecret(const std::string& id) {
    // readIncludingSensitive is the only way to get ciphertext/nonce back
    // -- both fields are schema.security.never_expose, so the generic
    // read() path DBAL's HTTP CRUD surface uses would return them empty.
    auto result = adapter_->readIncludingSensitive("EncryptedSecret", id);
    if (result.isError()) {
        return Error::notFound("Secret not found");
    }

    dbal::security::SealedSecret sealed;
    sealed.ciphertext = result.value().value("ciphertext", std::string());
    sealed.nonce = result.value().value("nonce", std::string());
    if (sealed.ciphertext.empty() || sealed.nonce.empty()) {
        return Error::internal("Secret record is missing ciphertext/nonce");
    }

    try {
        return dbal::security::open_secret(sealed);
    } catch (const std::exception& e) {
        return Error::internal(std::string("decryption failed: ") + e.what());
    }
}

} // namespace dbal
