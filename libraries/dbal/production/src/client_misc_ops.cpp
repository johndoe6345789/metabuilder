/**
 * @file client_misc_ops.cpp
 * @brief DBAL Client miscellaneous entity operations.
 *
 * This file contains operations for:
 * - Credential operations (set, verify, firstLogin management, delete)
 * - Workflow operations (CRUD: create, get, update, delete, list)
 * - Session operations (CRUD: create, get, update, delete, list)
 * - Package operations (CRUD + batch: create, get, update, delete, list, batchCreate/Update/Delete)
 */
#include "dbal/client.hpp"
#include "entities/index.hpp"
#include "store/in_memory_store.hpp"
#include "security/crypto/password_hash.hpp"
#include "validation/validation.hpp"

namespace dbal {

// ============================================================================
// Credential Operations
//
// Real implementation through the generic multi-backend adapter (Argon2id),
// replacing the previous entities::credential::* functions, which hashed
// with a non-cryptographic std::hash placeholder and operated on a
// process-local InMemoryStore that no HTTP route ever populated or read —
// confirmed dead code, now deleted (see entities/credential/crud/ removal).
// ============================================================================

Result<bool> Client::setCredential(const CreateCredentialInput& input) {
    if (!validation::isValidUsername(input.username)) {
        return Error::validationError("username must be 3-50 characters (alphanumeric, underscore, hyphen)");
    }
    // Legacy naming: input.passwordHash is actually the plain-text password to be hashed.
    if (!validation::isValidCredentialPassword(input.passwordHash)) {
        return Error::validationError("password must be 8-128 characters with at least one non-whitespace");
    }

    std::string encoded;
    try {
        encoded = dbal::security::hash_password(input.passwordHash);
    } catch (const std::exception& e) {
        return Error::internal(std::string("password hashing failed: ") + e.what());
    }

    // Credential's primary key field is "id" (holding the username value),
    // not "username" — the generic adapter's single-record methods always
    // operate on a column literally named "id" (see credential.json).
    nlohmann::json createData;
    createData["id"] = input.username;
    createData["passwordHash"] = encoded;
    if (!input.tenantId.empty()) {
        createData["tenantId"] = input.tenantId;
    }

    // Deliberately doesn't touch tenantId on update: this is a
    // password-reset path (existing user changing/resetting their
    // password), not a re-provisioning one -- an already-set tenant
    // shouldn't silently move just because someone reset their password.
    nlohmann::json updateData;
    updateData["passwordHash"] = encoded;

    auto result = adapter_->upsert("Credential", "id", input.username, createData, updateData);
    if (result.isError()) {
        return result.error();
    }
    return true;
}

Result<bool> Client::verifyCredential(const std::string& username, const std::string& password) {
    if (username.empty() || password.empty()) {
        return Error::validationError("username and password are required");
    }

    auto result = adapter_->readIncludingSensitive("Credential", username);
    if (result.isError()) {
        // Dummy hash computation (same real Argon2id cost as the success
        // path) so username enumeration can't be inferred from timing.
        try { dbal::security::hash_password(password); } catch (...) {}
        return Error::unauthorized("Invalid credentials");
    }

    std::string storedHash = result.value().value("passwordHash", std::string());
    if (storedHash.empty() || !dbal::security::verify_password(password, storedHash)) {
        return Error::unauthorized("Invalid credentials");
    }
    return true;
}

Result<std::string> Client::getCredentialTenantId(const std::string& username) {
    // Plain (non-sensitive) read -- tenantId isn't in Credential's
    // never_expose list, unlike passwordHash which verifyCredential above
    // fetches via readIncludingSensitive.
    auto result = adapter_->read("Credential", username);
    if (result.isError()) {
        return std::string("system");
    }
    // .value() only substitutes its default when the key is ABSENT -- a
    // nullable column with no value comes back as an explicit JSON null
    // (see SqlAdapter::rowToJson), which .value() would try to .get<string>()
    // and throw type_error.302 on. Must check for null first.
    const auto& row = result.value();
    if (!row.contains("tenantId") || row["tenantId"].is_null()) {
        return std::string("system");
    }
    std::string tenantId = row["tenantId"].get<std::string>();
    return tenantId.empty() ? std::string("system") : tenantId;
}

Result<std::string> Client::getUserRoleByUsername(const std::string& username) {
    // findByField, not listUsers()+filter -- a direct point lookup by the
    // real adapter rather than a filtered list, so this can't accidentally
    // return some other user's row (see client_user_ops.cpp's header
    // comment for the bug this replaced).
    auto result = adapter_->findByField("User", "username", username);
    if (result.isError()) {
        return std::string("user");
    }
    std::string role = result.value().value("role", std::string());
    return role.empty() ? std::string("user") : role;
}

Result<bool> Client::setCredentialFirstLoginFlag(const std::string& username, bool flag) {
    return entities::credential::setFirstLogin(getStore(), username, flag);
}

Result<bool> Client::getCredentialFirstLoginFlag(const std::string& username) {
    return entities::credential::getFirstLogin(getStore(), username);
}

Result<bool> Client::deleteCredential(const std::string& username) {
    auto result = adapter_->remove("Credential", username);
    if (result.isError()) {
        return result.error();
    }
    return true;
}

// ============================================================================
// Workflow Operations
// ============================================================================

Result<Workflow> Client::createWorkflow(const CreateWorkflowInput& input) {
    return entities::workflow::create(getStore(), input);
}

Result<Workflow> Client::getWorkflow(const std::string& id) {
    return entities::workflow::get(getStore(), id);
}

Result<Workflow> Client::updateWorkflow(const std::string& id, const UpdateWorkflowInput& input) {
    return entities::workflow::update(getStore(), id, input);
}

Result<bool> Client::deleteWorkflow(const std::string& id) {
    return entities::workflow::remove(getStore(), id);
}

Result<std::vector<Workflow>> Client::listWorkflows(const ListOptions& options) {
    return entities::workflow::list(getStore(), options);
}

// ============================================================================
// Session Operations
// ============================================================================

Result<Session> Client::createSession(const CreateSessionInput& input) {
    return entities::session::create(getStore(), input);
}

Result<Session> Client::getSession(const std::string& id) {
    return entities::session::get(getStore(), id);
}

Result<Session> Client::updateSession(const std::string& id, const UpdateSessionInput& input) {
    return entities::session::update(getStore(), id, input);
}

Result<bool> Client::deleteSession(const std::string& id) {
    return entities::session::remove(getStore(), id);
}

Result<std::vector<Session>> Client::listSessions(const ListOptions& options) {
    return entities::session::list(getStore(), options);
}

// ============================================================================
// Package Operations
// ============================================================================

Result<InstalledPackage> Client::createPackage(const CreatePackageInput& input) {
    return entities::package::create(getStore(), input);
}

Result<InstalledPackage> Client::getPackage(const std::string& id) {
    return entities::package::get(getStore(), id);
}

Result<InstalledPackage> Client::updatePackage(const std::string& id, const UpdatePackageInput& input) {
    return entities::package::update(getStore(), id, input);
}

Result<bool> Client::deletePackage(const std::string& id) {
    return entities::package::remove(getStore(), id);
}

Result<std::vector<InstalledPackage>> Client::listPackages(const ListOptions& options) {
    return entities::package::list(getStore(), options);
}

Result<int> Client::batchCreatePackages(const std::vector<CreatePackageInput>& inputs) {
    return entities::package::batchCreate(getStore(), inputs);
}

Result<int> Client::batchUpdatePackages(const std::vector<UpdatePackageBatchItem>& updates) {
    return entities::package::batchUpdate(getStore(), updates);
}

Result<int> Client::batchDeletePackages(const std::vector<std::string>& ids) {
    return entities::package::batchDelete(getStore(), ids);
}

} // namespace dbal
