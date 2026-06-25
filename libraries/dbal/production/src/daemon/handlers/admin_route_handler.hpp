/**
 * @file admin_route_handler.hpp
 * @brief Admin API endpoints for runtime database configuration
 */

#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <string>

namespace dbal {
namespace daemon {

class Server;  // Forward declaration for switchAdapter callback

namespace handlers {

class AdminRouteHandler {
public:
    using SwitchCallback = std::function<bool(const std::string& adapter, const std::string& url)>;
    using TestCallback = std::function<bool(const std::string& adapter, const std::string& url, std::string& error)>;
    using ConfigGetter = std::function<std::pair<std::string, std::string>()>;

    AdminRouteHandler(ConfigGetter getConfig, SwitchCallback switchFn, TestCallback testFn);

    void handleGetConfig(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    ) const;

    void handlePostConfig(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    );

    void handleGetAdapters(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    ) const;

    void handleTestConnection(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    );

private:
    bool validateAdminAuth(const drogon::HttpRequestPtr& request,
                           std::function<void(const drogon::HttpResponsePtr&)>& callback) const;
    void applyCorsHeaders(const drogon::HttpRequestPtr& request,
                          const drogon::HttpResponsePtr& response) const;

    ConfigGetter getConfig_;
    SwitchCallback switchAdapter_;
    TestCallback testConnection_;
};

} // namespace handlers
} // namespace daemon
} // namespace dbal
