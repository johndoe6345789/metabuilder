/**
 * @file AdapterProxy.h
 * @brief Upstream pull-through helpers for hosted adapters, used on a
 *        store miss so public packages resolve instead of 404ing.
 */

#pragma once

#include "../services/PgAdapterStore.h"

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>

#include <string>

namespace repo
{

/// @brief Proxy an npm package document from the configured upstream,
///        rewriting dist.tarball URLs back to this server's download route.
///        Returns nullptr if no upstream / not found.
drogon::HttpResponsePtr proxyNpmMeta(const AdapterInfo& a,
                                     const drogon::HttpRequestPtr& req,
                                     const std::string& name);

/// @brief Proxy an npm tarball (exact bytes, so shasum still verifies) from
///        the configured upstream, caching it. Returns nullptr if unavailable.
drogon::HttpResponsePtr proxyNpmDownload(const AdapterInfo& a,
                                         const std::string& name,
                                         const std::string& ver);

/// @brief Transparent conan v2 pull-through: map @p fullPath under @p prefix
///        to the upstream (/v2/...), cache the bytes and serve. conan verifies
///        its own file hashes, so no rewriting is needed. nullptr if disabled
///        or upstream missing.
drogon::HttpResponsePtr proxyConan(const std::string& prefix,
                                   const std::string& fullPath);

} // namespace repo
