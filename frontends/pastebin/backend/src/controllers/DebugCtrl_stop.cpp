#include "DebugCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DebugSessionStore.hpp"

namespace pastebin {

void DebugCtrl::stop(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                      const std::string& sessionId) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    DebugSessionStore::instance().remove(sessionId);

    Json::Value out;
    out["ok"] = true;
    cb(jsonResponse(out));
}

} // namespace pastebin
