/**
 * @file cas_ticket_store.hpp
 * @brief Issues and validates CAS tickets, backed by the CasTicket entity
 *        through the existing generic multi-backend adapter — the same
 *        CSPRNG-generate/SHA-256-hash/single-use pattern as OIDC's
 *        AuthCodeStore, since CAS's protocol carries no message-level
 *        cryptography of its own.
 */
#pragma once

#include "dbal/core/client.hpp"
#include "dbal/core/errors.hpp"
#include <string>

namespace dbal::cas {

enum class TicketType { ServiceTicket, TicketGrantingTicket };

struct ValidatedTicket {
    std::string userId;
    std::string tenantId;
};

class CasTicketStore {
public:
    explicit CasTicketStore(dbal::Client& client);

    /// Generates a CAS-style opaque ticket ("ST-..." or "TGT-..."), stores
    /// only its SHA-256 hash, returns the raw ticket.
    Result<std::string> issue(TicketType type, const std::string& userId,
                               const std::string& tenantId, const std::string& service,
                               int ttlSeconds);

    /**
     * @brief Look up, validate, and consume a service ticket at
     *        /cas/serviceValidate: must exist, be unconsumed, unexpired,
     *        and its stored `service` must exact-match @p service.
     *
     * NOTE: like AuthCodeStore::redeem, consumption is read-then-update via
     * the generic entity API — see that file's header for the accepted,
     * narrow TOCTOU window this shares.
     */
    Result<ValidatedTicket> validateServiceTicket(const std::string& rawTicket, const std::string& service);

private:
    dbal::Client& client_;
};

} // namespace dbal::cas
