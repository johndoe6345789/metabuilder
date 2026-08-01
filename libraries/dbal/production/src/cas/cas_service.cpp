/**
 * @file cas_service.cpp
 */
#include "cas_service.hpp"

namespace dbal::cas {

CasService::CasService(dbal::Client& client) : client_(client), ticket_store_(client_) {}

Result<std::string> CasService::issueServiceTicket(const std::string& userId, const std::string& tenantId,
                                                     const std::string& service) {
    return ticket_store_.issue(TicketType::ServiceTicket, userId, tenantId, service, /*ttlSeconds=*/10);
}

Result<ValidatedTicket> CasService::validateServiceTicket(const std::string& ticket, const std::string& service) {
    return ticket_store_.validateServiceTicket(ticket, service);
}

} // namespace dbal::cas
