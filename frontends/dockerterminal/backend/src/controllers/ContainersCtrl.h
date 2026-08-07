/**
 * @file ContainersCtrl.h
 * @brief Container listing + one-shot command endpoints.
 */

#pragma once

#include "ResponseTypes.hpp"

#include <drogon/HttpController.h>

namespace dockerterminal {

class ContainersCtrl : public drogon::HttpController<ContainersCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ContainersCtrl::list, "/api/containers", drogon::Get);
    ADD_METHOD_TO(ContainersCtrl::runCommand, "/api/containers/{id}/exec",
                  drogon::Post);
    METHOD_LIST_END

    void list(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void runCommand(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                     const std::string& id);
};

} // namespace dockerterminal
