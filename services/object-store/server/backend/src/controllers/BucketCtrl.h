/**
 * @file BucketCtrl.h
 * @brief S3 bucket management endpoints.
 */

#pragma once

#include <drogon/HttpController.h>

namespace s3
{

class BucketCtrl : public drogon::HttpController<BucketCtrl>
{
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(BucketCtrl::createBucket, "/{bucket}", drogon::Put,
                  "s3::AuthFilter");
    ADD_METHOD_TO(BucketCtrl::headBucket, "/{bucket}", drogon::Head,
                  "s3::AuthFilter");
    ADD_METHOD_TO(BucketCtrl::deleteBucket, "/{bucket}", drogon::Delete,
                  "s3::AuthFilter");
    ADD_METHOD_TO(BucketCtrl::listBuckets, "/", drogon::Get, "s3::AuthFilter");
    METHOD_LIST_END

    void createBucket(const drogon::HttpRequestPtr&,
                      std::function<void(const drogon::HttpResponsePtr&)>&&,
                      const std::string& bucket);

    void headBucket(const drogon::HttpRequestPtr&,
                    std::function<void(const drogon::HttpResponsePtr&)>&&,
                    const std::string& bucket);

    void deleteBucket(const drogon::HttpRequestPtr&,
                      std::function<void(const drogon::HttpResponsePtr&)>&&,
                      const std::string& bucket);

    void listBuckets(const drogon::HttpRequestPtr&,
                     std::function<void(const drogon::HttpResponsePtr&)>&&);
};

} // namespace s3
