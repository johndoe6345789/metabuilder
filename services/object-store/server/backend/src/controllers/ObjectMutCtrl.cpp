/**
 * @file ObjectMutCtrl.cpp
 * @brief S3 object PUT + DELETE handlers.
 */

#include "../services/BucketStore.h"
#include "../services/Globals.h"
#include "../services/ObjectStore.h"
#include "ObjectCtrl.h"

#include <memory>
#include <thread>

using namespace drogon;

namespace s3
{

void ObjectCtrl::putObject(const HttpRequestPtr& req,
                           std::function<void(const HttpResponsePtr&)>&& cb,
                           const std::string& bucket, const std::string& key)
{
    int bid = BucketStore::getId(
        bucket, req->attributes()->get<std::string>("owner"));
    if (bid == 0) {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k404NotFound);
        r->setBody("NoSuchBucket");
        cb(r);
        return;
    }

    auto ct = std::string(req->getHeader("Content-Type"));
    if (ct.empty())
        ct = "application/octet-stream";

    // Capture `req` (shared_ptr) so the body buffer stays alive in the thread.
    // This avoids copying potentially hundreds of MB — store() reads directly
    // from the request buffer via string_view.
    auto cbPtr = std::make_shared<std::function<void(const HttpResponsePtr&)>>(
        std::move(cb));

    // Run the disk write off the IO thread so large blobs don't block the
    // event loop long enough to drop postgres keepalives.
    std::thread([bid, bucket, key, ct, req, cbPtr]() {
        auto res = Globals::blobs->store(bucket, key, req->body());
        ObjectStore::put(bid, key, res.etag, (int64_t)res.size, ct, res.path);

        auto r = HttpResponse::newHttpResponse();
        r->addHeader("ETag", "\"" + res.etag + "\"");
        r->setStatusCode(k200OK);
        (*cbPtr)(r);
    }).detach();
}

void ObjectCtrl::deleteObject(const HttpRequestPtr& req,
                              std::function<void(const HttpResponsePtr&)>&& cb,
                              const std::string& bucket, const std::string& key)
{
    int bid = BucketStore::getId(
        bucket, req->attributes()->get<std::string>("owner"));
    if (bid == 0) {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k404NotFound);
        cb(r);
        return;
    }

    auto path = ObjectStore::remove(bid, key);
    if (!path.empty())
        Globals::blobs->remove(path);

    auto r = HttpResponse::newHttpResponse();
    r->setStatusCode(k204NoContent);
    cb(r);
}

} // namespace s3
