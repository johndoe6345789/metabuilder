/**
 * @file DebugCtrl.h
 * @brief DAP (Debug Adapter Protocol) debug session endpoints
 *        (/api/debug*).
 */

#pragma once

#include "Helpers.hpp"

#include <drogon/HttpController.h>

namespace pastebin {

class DebugCtrl : public drogon::HttpController<DebugCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(DebugCtrl::start, "/api/debug", drogon::Post);
    ADD_METHOD_TO(DebugCtrl::sendDap, "/api/debug/{sessionId}/dap",
                  drogon::Post);
    ADD_METHOD_TO(DebugCtrl::poll, "/api/debug/{sessionId}/poll",
                  drogon::Get);
    ADD_METHOD_TO(DebugCtrl::stop, "/api/debug/{sessionId}", drogon::Delete);
    METHOD_LIST_END

    void start(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void sendDap(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                 const std::string& sessionId);
    void poll(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
              const std::string& sessionId);
    void stop(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
              const std::string& sessionId);
};

} // namespace pastebin
