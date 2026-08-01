/**
 * @file cas_service.hpp
 * @brief Orchestrates the CAS 2.0/3.0 protocol. Mirrors OidcService's role:
 *        HTTP handlers only translate request/response shape, validation
 *        logic lives here.
 */
#pragma once

#include "cas_ticket_store.hpp"
#include "dbal/core/client.hpp"
#include "dbal/core/errors.hpp"
#include <string>

namespace dbal::cas {

class CasService {
public:
    explicit CasService(dbal::Client& client);

    /// Issues a service ticket after successful login. 10s TTL per the CAS
    /// protocol spec's recommendation that STs be single-use and short-lived.
    Result<std::string> issueServiceTicket(const std::string& userId, const std::string& tenantId,
                                            const std::string& service);

    /// /cas/serviceValidate — validates and consumes a service ticket.
    Result<ValidatedTicket> validateServiceTicket(const std::string& ticket, const std::string& service);

private:
    dbal::Client& client_;
    CasTicketStore ticket_store_;
};

} // namespace dbal::cas
