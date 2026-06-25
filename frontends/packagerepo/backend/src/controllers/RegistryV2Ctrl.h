#pragma once

#include <drogon/HttpController.h>

namespace repo
{
class RegistryV2Ctrl : public drogon::HttpController<RegistryV2Ctrl>
{
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(RegistryV2Ctrl::ping, "/v2", drogon::Get);
    ADD_METHOD_TO(RegistryV2Ctrl::ping, "/v2/", drogon::Get);
    ADD_METHOD_TO(RegistryV2Ctrl::ping, "/v2", drogon::Head);
    ADD_METHOD_TO(RegistryV2Ctrl::ping, "/v2/", drogon::Head);
    ADD_METHOD_TO(RegistryV2Ctrl::catalog, "/v2/_catalog", drogon::Get);
    // Docker repository names can have multiple path segments (e.g.
    // "user/project/image"). Match greedily: the last segment is
    // {name} and everything before it is {ns}, so ns + "/" + name
    // rebuilds the full name. Regex routes replace the old fixed
    // two-segment {ns}/{name} paths, which 404'd on 3+ segments.
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::tags,
                  "/v2/(.+)/([^/]+)/tags/list", drogon::Get);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::startUpload,
                  "/v2/(.+)/([^/]+)/blobs/uploads/", drogon::Post);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::uploadStatus,
                  "/v2/(.+)/([^/]+)/blobs/uploads/([^/]+)", drogon::Get);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::uploadStatus,
                  "/v2/(.+)/([^/]+)/blobs/uploads/([^/]+)", drogon::Head);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::patchUpload,
                  "/v2/(.+)/([^/]+)/blobs/uploads/([^/]+)", drogon::Patch);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::completeUpload,
                  "/v2/(.+)/([^/]+)/blobs/uploads/([^/]+)", drogon::Put);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::cancelUpload,
                  "/v2/(.+)/([^/]+)/blobs/uploads/([^/]+)", drogon::Delete);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::headBlob,
                  "/v2/(.+)/([^/]+)/blobs/(sha256:[a-f0-9]+)", drogon::Head);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::getBlob,
                  "/v2/(.+)/([^/]+)/blobs/(sha256:[a-f0-9]+)", drogon::Get);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::headManifest,
                  "/v2/(.+)/([^/]+)/manifests/([^/]+)", drogon::Head);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::getManifest,
                  "/v2/(.+)/([^/]+)/manifests/([^/]+)", drogon::Get);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::putManifest,
                  "/v2/(.+)/([^/]+)/manifests/([^/]+)", drogon::Put);
    ADD_METHOD_VIA_REGEX(RegistryV2Ctrl::deleteManifest,
                  "/v2/(.+)/([^/]+)/manifests/([^/]+)", drogon::Delete);
    METHOD_LIST_END

    void ping(const drogon::HttpRequestPtr&,
              std::function<void(const drogon::HttpResponsePtr&)>&&);
    void catalog(const drogon::HttpRequestPtr&,
                 std::function<void(const drogon::HttpResponsePtr&)>&&);
    void tags(const drogon::HttpRequestPtr&,
              std::function<void(const drogon::HttpResponsePtr&)>&&,
              const std::string&, const std::string&);
    void startUpload(const drogon::HttpRequestPtr&,
                     std::function<void(const drogon::HttpResponsePtr&)>&&,
                     const std::string&, const std::string&);
    void uploadStatus(const drogon::HttpRequestPtr&,
                      std::function<void(const drogon::HttpResponsePtr&)>&&,
                      const std::string&, const std::string&, const std::string&);
    void patchUpload(const drogon::HttpRequestPtr&,
                     std::function<void(const drogon::HttpResponsePtr&)>&&,
                     const std::string&, const std::string&, const std::string&);
    void completeUpload(const drogon::HttpRequestPtr&,
                        std::function<void(const drogon::HttpResponsePtr&)>&&,
                        const std::string&, const std::string&,
                        const std::string&);
    void cancelUpload(const drogon::HttpRequestPtr&,
                      std::function<void(const drogon::HttpResponsePtr&)>&&,
                      const std::string&, const std::string&,
                      const std::string&);
    void headBlob(const drogon::HttpRequestPtr&,
                  std::function<void(const drogon::HttpResponsePtr&)>&&,
                  const std::string&, const std::string&, const std::string&);
    void getBlob(const drogon::HttpRequestPtr&,
                 std::function<void(const drogon::HttpResponsePtr&)>&&,
                 const std::string&, const std::string&, const std::string&);
    void headManifest(const drogon::HttpRequestPtr&,
                      std::function<void(const drogon::HttpResponsePtr&)>&&,
                      const std::string&, const std::string&, const std::string&);
    void getManifest(const drogon::HttpRequestPtr&,
                     std::function<void(const drogon::HttpResponsePtr&)>&&,
                     const std::string&, const std::string&, const std::string&);
    void putManifest(const drogon::HttpRequestPtr&,
                     std::function<void(const drogon::HttpResponsePtr&)>&&,
                     const std::string&, const std::string&, const std::string&);
    void deleteManifest(const drogon::HttpRequestPtr&,
                        std::function<void(const drogon::HttpResponsePtr&)>&&,
                        const std::string&, const std::string&,
                        const std::string&);
};
} // namespace repo
