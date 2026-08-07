#include "ContainersCtrl.h"
#include "../services/DbalAuth.hpp"
#include "../services/DockerClient.hpp"
#include "../util.hpp"

namespace dockerterminal {

namespace {

drogon::HttpResponsePtr errorResponse(const std::string& msg,
                                       drogon::HttpStatusCode code) {
    Json::Value e;
    e["error"] = msg;
    auto r = drogon::HttpResponse::newHttpJsonResponse(e);
    r->setStatusCode(code);
    return r;
}

} // namespace

void ContainersCtrl::list(const drogon::HttpRequestPtr& req,
                           ResponseCb&& cb) {
    if (!verifyAdminCaller(req)) {
        cb(errorResponse("Unauthorized", drogon::k401Unauthorized));
        return;
    }

    try {
        DockerClient client;
        const auto containers = client.listContainers();
        const int64_t now = time(nullptr);

        Json::Value list(Json::arrayValue);
        for (const auto& c : containers) {
            Json::Value o;
            o["id"] = c.id;
            o["name"] = c.name;
            o["image"] = c.image;
            o["status"] = c.status;
            o["uptime"] = c.status == "running"
                              ? formatUptime(c.createdEpochSeconds, now)
                              : "N/A";
            list.append(o);
        }
        Json::Value out;
        out["containers"] = list;
        cb(drogon::HttpResponse::newHttpJsonResponse(out));
    } catch (const std::exception& e) {
        cb(errorResponse(e.what(), drogon::k500InternalServerError));
    }
}

void ContainersCtrl::runCommand(const drogon::HttpRequestPtr& req,
                                 ResponseCb&& cb, const std::string& id) {
    if (!verifyAdminCaller(req)) {
        cb(errorResponse("Unauthorized", drogon::k401Unauthorized));
        return;
    }

    const auto body = req->getJsonObject();
    const std::string shellLine = (body && body->isMember("command"))
                                       ? (*body)["command"].asString()
                                       : "/bin/sh";

    try {
        DockerClient client;
        const auto result = client.runInContainer(id, shellLine);
        Json::Value out;
        out["output"] = result.output;
        out["exit_code"] = result.exitCode;
        cb(drogon::HttpResponse::newHttpJsonResponse(out));
    } catch (const std::exception& e) {
        cb(errorResponse(e.what(), drogon::k500InternalServerError));
    }
}

} // namespace dockerterminal
