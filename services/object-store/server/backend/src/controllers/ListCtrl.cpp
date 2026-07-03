/**
 * @file ListCtrl.cpp
 * @brief S3 ListObjectsV2 endpoint.
 */

#include "ListCtrl.h"
#include "../services/BucketStore.h"
#include "../services/ObjectStore.h"
#include "../services/XmlUtil.h"

using namespace drogon;

namespace s3
{

void ListCtrl::listObjects(const HttpRequestPtr& req,
                           std::function<void(const HttpResponsePtr&)>&& cb,
                           const std::string& bucket)
{
    int bid = BucketStore::getId(bucket);
    if (bid == 0) {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k404NotFound);
        r->setBody("NoSuchBucket");
        cb(r);
        return;
    }

    auto prefix = req->getParameter("prefix");
    int maxKeys = 1000;
    auto mk = req->getParameter("max-keys");
    if (!mk.empty()) {
        try {
            maxKeys = std::clamp(std::stoi(mk), 1, 1000);
        } catch (...) {
            maxKeys = 1000;
        }
    }

    auto rows = ObjectStore::list(bid, prefix, maxKeys);

    std::string xml = "<?xml version=\"1.0\"?>"
                      "<ListBucketResult>"
                      "<Name>" +
                      xmlEscape(bucket) +
                      "</Name>"
                      "<Prefix>" +
                      xmlEscape(prefix) +
                      "</Prefix>"
                      "<MaxKeys>" +
                      std::to_string(maxKeys) +
                      "</MaxKeys>"
                      "<IsTruncated>false</IsTruncated>";

    for (const auto& obj : rows) {
        xml += "<Contents>"
               "<Key>" +
               xmlEscape(obj["key"].asString()) +
               "</Key>"
               "<Size>" +
               std::to_string(obj["size"].asInt64()) +
               "</Size>"
               "<ETag>\"" +
               xmlEscape(obj["etag"].asString()) +
               "\"</ETag>"
               "<LastModified>" +
               obj["last_modified"].asString() +
               "</LastModified>"
               "</Contents>";
    }
    xml += "</ListBucketResult>";

    auto r = HttpResponse::newHttpResponse();
    r->setContentTypeString("application/xml");
    r->setBody(xml);
    cb(r);
}

} // namespace s3
