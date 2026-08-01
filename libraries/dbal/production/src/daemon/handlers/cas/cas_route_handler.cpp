/**
 * @file cas_route_handler.cpp
 */
#include "cas_route_handler.hpp"

#include <drogon/drogon.h>
#include <spdlog/spdlog.h>

namespace dbal::daemon::handlers::cas {

namespace {
std::string xmlEscape(const std::string& in) {
    std::string out;
    out.reserve(in.size());
    for (char c : in) {
        switch (c) {
            case '&': out += "&amp;"; break;
            case '<': out += "&lt;"; break;
            case '>': out += "&gt;"; break;
            case '"': out += "&quot;"; break;
            default: out += c;
        }
    }
    return out;
}
} // namespace

CasRouteHandler::CasRouteHandler(dbal::cas::CasService& service) : service_(service) {}

void CasRouteHandler::handleServiceValidate(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) {

    std::string ticket = req->getParameter("ticket");
    std::string service = req->getParameter("service");

    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setContentTypeCodeAndCustomString(drogon::CT_CUSTOM, "text/xml; charset=utf-8");

    if (ticket.empty() || service.empty()) {
        resp->setBody(
            "<cas:serviceResponse xmlns:cas=\"http://www.yale.edu/tp/cas\">"
            "<cas:authenticationFailure code=\"INVALID_REQUEST\">"
            "ticket and service are required"
            "</cas:authenticationFailure></cas:serviceResponse>");
        cb(resp);
        return;
    }

    auto result = service_.validateServiceTicket(ticket, service);
    if (result.isError()) {
        spdlog::info("[cas] /serviceValidate rejected for service {}: {}", service, result.error().what());
        auto [code, desc] = std::pair<std::string, std::string>("INVALID_TICKET", result.error().what());
        auto pos = desc.find(": ");
        if (pos != std::string::npos) {
            code = desc.substr(0, pos);
            desc = desc.substr(pos + 2);
        }
        resp->setBody(
            "<cas:serviceResponse xmlns:cas=\"http://www.yale.edu/tp/cas\">"
            "<cas:authenticationFailure code=\"" + xmlEscape(code) + "\">" +
            xmlEscape(desc) +
            "</cas:authenticationFailure></cas:serviceResponse>");
        cb(resp);
        return;
    }

    const auto& validated = result.value();
    resp->setBody(
        "<cas:serviceResponse xmlns:cas=\"http://www.yale.edu/tp/cas\">"
        "<cas:authenticationSuccess>"
        "<cas:user>" + xmlEscape(validated.userId) + "</cas:user>"
        "</cas:authenticationSuccess></cas:serviceResponse>");
    cb(resp);
}

} // namespace dbal::daemon::handlers::cas
