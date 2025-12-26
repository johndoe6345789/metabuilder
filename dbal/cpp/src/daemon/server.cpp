/**
 * @file server.cpp
 * @brief Drogon-backed HTTP server implementation.
 */

#include "server.hpp"

#include <drogon/drogon.h>
#include <json/json.h>
#include <functional>

namespace {

std::string trim_string(const std::string& value) {
    const auto start = value.find_first_not_of(" \t\r\n");
    if (start == std::string::npos) {
        return "";
    }
    const auto end = value.find_last_not_of(" \t\r\n");
    return value.substr(start, end - start + 1);
}

std::string resolve_real_ip(const drogon::HttpRequestPtr& request) {
    auto real_ip = request->getHeader("X-Real-IP");
    if (!real_ip.empty()) {
        return real_ip;
    }

    auto forwarded_for = request->getHeader("X-Forwarded-For");
    if (!forwarded_for.empty()) {
        const auto comma = forwarded_for.find(',');
        if (comma != std::string::npos) {
            forwarded_for = forwarded_for.substr(0, comma);
        }
        return trim_string(forwarded_for);
    }

    return "";
}

std::string resolve_forwarded_proto(const drogon::HttpRequestPtr& request) {
    auto forwarded_proto = request->getHeader("X-Forwarded-Proto");
    if (!forwarded_proto.empty()) {
        return forwarded_proto;
    }
    return "http";
}

drogon::HttpResponsePtr build_json_response(const Json::Value& body) {
    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    response->addHeader("Server", "DBAL/1.0.0");
    return response;
}

drogon::HttpResponsePtr handle_health(const drogon::HttpRequestPtr&) {
    Json::Value body;
    body["status"] = "healthy";
    body["service"] = "dbal";
    return build_json_response(body);
}

drogon::HttpResponsePtr handle_version(const drogon::HttpRequestPtr&) {
    Json::Value body;
    body["version"] = "1.0.0";
    body["service"] = "DBAL Daemon";
    return build_json_response(body);
}

drogon::HttpResponsePtr handle_status(
    const drogon::HttpRequestPtr& request,
    const std::string& address
) {
    Json::Value body;
    body["status"] = "running";
    body["address"] = address;
    body["real_ip"] = resolve_real_ip(request);
    body["forwarded_proto"] = resolve_forwarded_proto(request);
    return build_json_response(body);
}

} // namespace

namespace dbal {
namespace daemon {

Server::Server(const std::string& bind_address, int port)
    : bind_address_(bind_address),
      port_(port),
      running_(false),
      routes_registered_(false) {}

Server::~Server() {
    stop();
}

bool Server::start() {
    if (running_.load()) {
        return true;
    }

    registerRoutes();
    drogon::app().addListener(bind_address_, static_cast<uint16_t>(port_));

    running_.store(true);
    server_thread_ = std::thread(&Server::runServer, this);
    return true;
}

void Server::stop() {
    if (!running_.load()) {
        return;
    }

    drogon::app().quit();
    if (server_thread_.joinable()) {
        server_thread_.join();
    }
    running_.store(false);
}

bool Server::isRunning() const {
    return running_.load();
}

std::string Server::address() const {
    return bind_address_ + ":" + std::to_string(port_);
}

void Server::registerRoutes() {
    if (routes_registered_) {
        return;
    }

    const std::string server_address = address();
    auto status_handler = [server_address](const drogon::HttpRequestPtr& request) {
        return handle_status(request, server_address);
    };

    auto health_handler = [](const drogon::HttpRequestPtr& request) {
        return handle_health(request);
    };
    auto version_handler = [](const drogon::HttpRequestPtr& request) {
        return handle_version(request);
    };

    drogon::app().registerHandler("/health", health_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/healthz", health_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/version", version_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/api/version", version_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/status", status_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/api/status", status_handler, {drogon::HttpMethod::Get});

    routes_registered_ = true;
}

void Server::runServer() {
    drogon::app().run();
    running_.store(false);
}

} // namespace daemon
} // namespace dbal
