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

} // namespace repo
