/**
 * @file cas_ticket_store.cpp
 */
#include "cas_ticket_store.hpp"
#include "../security/tokens/generate_token.hpp"
#include "../security/crypto/sha256.hpp"

#include <chrono>
#include <spdlog/spdlog.h>

namespace dbal::cas {

namespace {
long long nowUnix() {
    return std::chrono::duration_cast<std::chrono::seconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
}

const char* typeString(TicketType type) {
    return type == TicketType::TicketGrantingTicket ? "TGT" : "ST";
}

// CAS convention: tickets are prefixed by type ("ST-...", "TGT-...") so a
// glance at the raw string (e.g. in logs) identifies its kind.
std::string ticketPrefix(TicketType type) {
    return type == TicketType::TicketGrantingTicket ? "TGT-" : "ST-";
}
} // namespace

CasTicketStore::CasTicketStore(dbal::Client& client) : client_(client) {}

Result<std::string> CasTicketStore::issue(TicketType type, const std::string& userId,
                                            const std::string& tenantId, const std::string& service,
                                            int ttlSeconds) {
    std::string rawTicket = ticketPrefix(type) + dbal::security::generate_token();
    std::string ticketHash = dbal::security::sha256_hex(rawTicket);

    nlohmann::json data;
    data["ticketHash"] = ticketHash;
    data["ticketType"] = typeString(type);
    data["userId"] = userId;
    data["tenantId"] = tenantId;
    data["service"] = service;
    data["consumedAt"] = nullptr;
    data["expiresAt"] = nowUnix() + ttlSeconds;
    data["createdAt"] = nowUnix();

    auto result = client_.createEntity("CasTicket", data);
    if (result.isError()) {
        return result.error();
    }
    return rawTicket;
}

Result<ValidatedTicket> CasTicketStore::validateServiceTicket(const std::string& rawTicket,
                                                                const std::string& service) {
    std::string ticketHash = dbal::security::sha256_hex(rawTicket);

    dbal::ListOptions opts;
    opts.filter["ticketHash"] = ticketHash;
    opts.limit = 1;

    auto listResult = client_.listEntities("CasTicket", opts);
    if (listResult.isError()) {
        return listResult.error();
    }
    const auto& items = listResult.value().items;
    if (items.empty()) {
        return Error::notFound("INVALID_TICKET: ticket not recognized");
    }

    const auto& row = items.front();
    std::string id = row.value("id", std::string());
    std::string storedService = row.value("service", std::string());
    long long expiresAt = row.value("expiresAt", 0LL);
    bool consumed = row.contains("consumedAt") && !row["consumedAt"].is_null();

    if (consumed) {
        spdlog::warn("[cas] Service ticket replay detected for service {} — rejecting", service);
        return Error::validationError("INVALID_TICKET: ticket already used");
    }
    if (expiresAt <= nowUnix()) {
        return Error::validationError("INVALID_TICKET: ticket expired");
    }
    if (storedService != service) {
        return Error::validationError("INVALID_SERVICE: service does not match ticket issuance");
    }

    // Mark consumed. See header docs for the known, narrow TOCTOU window here.
    nlohmann::json update;
    update["consumedAt"] = nowUnix();
    auto updateResult = client_.updateEntity("CasTicket", id, update);
    if (updateResult.isError()) {
        return updateResult.error();
    }

    ValidatedTicket validated;
    validated.userId = row.value("userId", std::string());
    validated.tenantId = row.value("tenantId", std::string());
    return validated;
}

} // namespace dbal::cas
