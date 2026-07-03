/**
 * @file ObjectCtrl.cpp
 * @brief S3 object GET + HEAD handlers.
 */

#include "ObjectCtrl.h"
#include "../services/BucketStore.h"
#include "../services/Globals.h"
#include "../services/ObjectStore.h"

using namespace drogon;

namespace s3
{

void ObjectCtrl::getObject(const HttpRequestPtr& req,
                           std::function<void(const HttpResponsePtr&)>&& cb,
                           const std::string& bucket, const std::string& key)
{
    int bid = BucketStore::getId(bucket);
    if (bid == 0) {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k404NotFound);
        r->setBody("NoSuchBucket");
        cb(r);
        return;
    }

    auto meta = ObjectStore::get(bid, key);
    if (meta.isNull()) {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k404NotFound);
        r->setBody("NoSuchKey");
        cb(r);
        return;
    }

    auto data = Globals::blobs->read(meta["storage_path"].asString());
    auto r = HttpResponse::newHttpResponse();
    r->setContentTypeString(meta["content_type"].asString());
    r->addHeader("ETag", "\"" + meta["etag"].asString() + "\"");
    r->addHeader("Content-Length", std::to_string(meta["size"].asInt64()));
    r->addHeader("Last-Modified", meta["last_modified"].asString());
    r->setBody(std::move(data));
    cb(r);
}

void ObjectCtrl::headObject(const HttpRequestPtr& req,
                            std::function<void(const HttpResponsePtr&)>&& cb,
                            const std::string& bucket, const std::string& key)
{
    int bid = BucketStore::getId(bucket);
    auto meta = (bid > 0) ? ObjectStore::get(bid, key) : Json::nullValue;
    auto r = HttpResponse::newHttpResponse();
    if (meta.isNull()) {
        r->setStatusCode(k404NotFound);
    } else {
        r->addHeader("ETag", "\"" + meta["etag"].asString() + "\"");
        r->addHeader("Content-Length", std::to_string(meta["size"].asInt64()));
        r->setContentTypeString(meta["content_type"].asString());
    }
    cb(r);
}

} // namespace s3
