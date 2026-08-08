#pragma once

#include <optional>
#include <string>

namespace email_backend {

/// Creates a DBAL EncryptedSecret from `plaintext` (see DBAL's
/// reversible_crypto.hpp / /admin/secrets), returning its id -- this id
/// is what gets stored as EmailClient.credentialId, never the password
/// itself. Returns nullopt on failure.
std::optional<std::string> createEncryptedSecret(const std::string& plaintext);

/// Decrypts a previously created secret. Only ever called just-in-time,
/// right before an IMAP/SMTP connection -- never persisted or logged.
/// Returns nullopt on failure.
std::optional<std::string> revealEncryptedSecret(const std::string& id);

} // namespace email_backend
