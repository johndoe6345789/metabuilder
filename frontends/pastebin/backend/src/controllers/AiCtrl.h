/**
 * @file AiCtrl.h
 * @brief Server-side AI key storage and proxied inference calls
 *        under /api/ai/.
 */

#pragma once

#include "Helpers.hpp"

#include <drogon/HttpController.h>

namespace pastebin {

class AiCtrl : public drogon::HttpController<AiCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AiCtrl::getSettings, "/api/ai/settings", drogon::Get);
    ADD_METHOD_TO(AiCtrl::saveSettings, "/api/ai/settings", drogon::Post);
    ADD_METHOD_TO(AiCtrl::analyze, "/api/ai/analyze", drogon::Post);
    METHOD_LIST_END

    void getSettings(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void saveSettings(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void analyze(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
};

} // namespace pastebin
