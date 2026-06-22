/**
 * @file AdapterProxy.cpp
 * @brief npm pull-through proxy helpers.
 */

#include "AdapterProxy.h"
#include "../services/Globals.h"
#include "../services/ProxyCache.h"

#include <json/json.h>

using namespace drogon;

namespace repo
{

static std::string baseUrl(const HttpRequestPtr& req)
{
    auto scheme = req->getHeader("X-Forwarded-Proto");
    if (scheme.empty()) scheme = "http";
    return scheme + "://" + req->getHeader("Host");
}

// npm tarball file name drops any @scope/ prefix: @s/p -> p-<ver>.tgz
static std::string tarballPath(const std::string& name, const std::string& ver)
{
    auto slash = name.rfind('/');
    auto file = slash == std::string::npos ? name : name.substr(slash + 1);
    return "/" + name + "/-/" + file + "-" + ver + ".tgz";
}

drogon::HttpResponsePtr proxyNpmMeta(const AdapterInfo& a,
                                     const HttpRequestPtr& req,
                                     const std::string& name)
{
    if (a.name != "npm" || Globals::npmUpstream.empty())
        return nullptr;

    auto res = ProxyCache::fetch(Globals::npmUpstream, "/" + name);
    if (!res.ok)
        return nullptr;

    Json::CharReaderBuilder rb;
    Json::Value doc;
    std::string errs;
    std::unique_ptr<Json::CharReader> rd(rb.newCharReader());
    if (!rd->parse(res.body.data(), res.body.data() + res.body.size(), &doc,
                   &errs))
        return nullptr;

    // Rewrite every version's tarball URL to this server's download route so
    // the tarball fetch also pulls through here.
    const auto dl = baseUrl(req) + a.prefix + "/dl/" + name + "/";
    for (const auto& ver : doc["versions"].getMemberNames())
        doc["versions"][ver]["dist"]["tarball"] = dl + ver;

    Json::StreamWriterBuilder wb;
    wb["indentation"] = "";
    auto r = HttpResponse::newHttpResponse();
    r->setContentTypeString("application/json");
    r->setBody(Json::writeString(wb, doc));
    return r;
}

drogon::HttpResponsePtr proxyNpmDownload(const AdapterInfo& a,
                                         const std::string& name,
                                         const std::string& ver)
{
    if (a.name != "npm" || Globals::npmUpstream.empty())
        return nullptr;

    auto res = ProxyCache::fetch(Globals::npmUpstream, tarballPath(name, ver));
    if (!res.ok)
        return nullptr;

    auto r = HttpResponse::newHttpResponse();
    r->setContentTypeString(a.contentType);
    r->setBody(std::move(res.body));
    return r;
}

drogon::HttpResponsePtr proxyConan(const std::string& prefix,
                                   const std::string& fullPath)
{
    if (Globals::conanUpstream.empty())
        return nullptr;

    // /conan/v2/... -> upstream /v2/...
    std::string up = fullPath.substr(prefix.size());
    if (up.empty() || up.front() != '/')
        up = "/" + up;

    // conan validates a remote via /v1/ping (then /v2 for revisions),
    // expecting the capabilities header (the upstream CDN 404s it). Answer it
    // ourselves so the remote is "valid".
    const bool isPing = up.size() >= 5 && up.compare(up.size() - 5, 5, "/ping") == 0;
    if (isPing) {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k200OK);
        r->addHeader("X-Conan-Server-Capabilities", "revisions,complex_search");
        return r;
    }

    auto res = ProxyCache::fetch(Globals::conanUpstream, up);
    if (!res.ok)
        return nullptr;

    // ".../files/<name>" is a binary artifact; everything else is JSON.
    const bool isFile = up.find("/files/") != std::string::npos;
    auto r = HttpResponse::newHttpResponse();
    r->setContentTypeString(isFile ? "application/octet-stream"
                                   : "application/json");
    r->setBody(std::move(res.body));
    return r;
}

} // namespace repo
