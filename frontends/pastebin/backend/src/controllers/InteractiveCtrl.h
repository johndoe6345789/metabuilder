/**
 * @file InteractiveCtrl.h
 * @brief Interactive code-execution session endpoints
 *        (/api/run/interactive*).
 */

#pragma once

#include "Helpers.hpp"

#include <drogon/HttpController.h>

namespace pastebin {

class InteractiveCtrl : public drogon::HttpController<InteractiveCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(InteractiveCtrl::start, "/api/run/interactive",
                  drogon::Post);
    ADD_METHOD_TO(InteractiveCtrl::poll,
                  "/api/run/interactive/{sessionId}/poll", drogon::Get);
    ADD_METHOD_TO(InteractiveCtrl::input,
                  "/api/run/interactive/{sessionId}/input", drogon::Post);
    METHOD_LIST_END

    void start(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void poll(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
              const std::string& sessionId);
    void input(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
               const std::string& sessionId);
};

} // namespace pastebin
