/**
 * @file BucketCtrl.cpp
 * @brief S3 bucket create, head, delete, list.
 */

#include "BucketCtrl.h"
#include "../services/BucketStore.h"
#include "../services/Globals.h"

using namespace drogon;

namespace s3
{

void BucketCtrl::createBucket(const HttpRequestPtr& req,
                              std::function<void(const HttpResponsePtr&)>&& cb,
                              const std::string& bucket)
{
    bool ok = BucketStore::create(bucket, Globals::region);
    if (!ok) {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k409Conflict);
        r->setBody("BucketAlreadyExists");
        cb(r);
        return;
    }
    auto r = HttpResponse::newHttpResponse();
    r->addHeader("Location", "/" + bucket);
    r->setStatusCode(k200OK);
    cb(r);
}

void BucketCtrl::headBucket(const HttpRequestPtr& req,
                            std::function<void(const HttpResponsePtr&)>&& cb,
                            const std::string& bucket)
{
    auto b = BucketStore::get(bucket);
    auto r = HttpResponse::newHttpResponse();
    if (b.isNull()) {
        r->setStatusCode(k404NotFound);
    } else {
        r->addHeader("x-amz-bucket-region", b["region"].asString());
    }
    cb(r);
}

void BucketCtrl::deleteBucket(const HttpRequestPtr& req,
                              std::function<void(const HttpResponsePtr&)>&& cb,
                              const std::string& bucket)
{
    bool ok = BucketStore::remove(bucket);
    auto r = HttpResponse::newHttpResponse();
    r->setStatusCode(ok ? k204NoContent : k404NotFound);
    cb(r);
}

void BucketCtrl::listBuckets(const HttpRequestPtr& req,
                             std::function<void(const HttpResponsePtr&)>&& cb)
{
    auto buckets = BucketStore::list();
    // Return S3-style XML response
    std::string xml = "<?xml version=\"1.0\"?>"
                      "<ListAllMyBucketsResult>"
                      "<Buckets>";
    for (const auto& b : buckets) {
        xml += "<Bucket><Name>" + b["name"].asString() +
               "</Name><CreationDate>" + b["created_at"].asString() +
               "</CreationDate></Bucket>";
    }
    xml += "</Buckets></ListAllMyBucketsResult>";
    auto r = HttpResponse::newHttpResponse();
    r->setContentTypeString("application/xml");
    r->setBody(xml);
    cb(r);
}

} // namespace s3
