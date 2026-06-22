/**
 * @file GenericAdapterCtrl.cpp
 * @brief Dynamic route registration for all protocol adapters.
 *
 * Reads adapter configs from AdapterGlobals (loaded from DB)
 * and registers Drogon handlers for meta + download routes.
 * Drogon supports max 2 path params ({1}, {2}).
 */

#include "GenericAdapterCtrl.h"
#include "AdapterHandlers.h"
#include "../services/AdapterGlobals.h"
#include "../services/AdapterTemplate.h"

#include <drogon/drogon.h>

#include <string>

using namespace drogon;
using Cb = std::function<void(const HttpResponsePtr&)>;

namespace repo
{

void registerAdapterRoutes()
{
    auto& vec = AdapterGlobals::adapters;

    for (size_t i = 0; i < vec.size(); ++i) {
        auto* pa = &vec[i];
        if (pa->metaRegex.empty()) continue;

        int params = countPathParams(pa->metaRegex);

        if (params > 2) continue;

        // Register meta or index handler
        if (pa->isIndex && params == 0) {
            app().registerHandler(pa->metaRegex,
                [pa](const HttpRequestPtr& r, Cb&& cb) {
                    handleIndex(*pa, r, std::move(cb));
                }, {Get});
        } else if (pa->isIndex && params == 1) {
            app().registerHandler(pa->metaRegex,
                [pa](const HttpRequestPtr& r, Cb&& cb,
                     const std::string&) {
                    handleIndex(*pa, r, std::move(cb));
                }, {Get});
        } else if (pa->isIndex && params == 2) {
            app().registerHandler(pa->metaRegex,
                [pa](const HttpRequestPtr& r, Cb&& cb,
                     const std::string&,
                     const std::string&) {
                    handleIndex(*pa, r, std::move(cb));
                }, {Get});
        } else if (params == 1) {
            auto route = pa->metaRegex;
            app().registerHandler(route,
                [pa](const HttpRequestPtr& r, Cb&& cb,
                     const std::string& p1) {

                    handlePackageMeta(
                        *pa, r, p1, std::move(cb));
                }, {Get});
        } else if (params == 2) {
            app().registerHandler(pa->metaRegex,
                [pa](const HttpRequestPtr& r, Cb&& cb,
                     const std::string& p1,
                     const std::string& p2) {
                    handleVersionMeta(
                        *pa, r, p1, p2, std::move(cb));
                }, {Get});
        }

        // Standard download: {prefix}/dl/{name}/{ver}
        auto dlPath = pa->prefix + "/dl/{1}/{2}";
        app().registerHandler(dlPath,
            [pa](const HttpRequestPtr& r, Cb&& cb,
                 const std::string& n,
                 const std::string& v) {
                handleDownload(
                    *pa, r, n, v, std::move(cb));
            }, {Get});
    }
}

} // namespace repo
