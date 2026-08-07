/**
 * @file RunCtrl.h
 * @brief One-shot code execution endpoint (/api/run).
 */

#pragma once

#include "Helpers.hpp"

#include <drogon/HttpController.h>

namespace pastebin {

class RunCtrl : public drogon::HttpController<RunCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(RunCtrl::run, "/api/run", drogon::Post);
    METHOD_LIST_END

    void run(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
};

} // namespace pastebin
