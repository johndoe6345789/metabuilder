/**
 * @file ObjectCtrl.h
 * @brief S3 object PUT, GET, DELETE, HEAD, list.
 */

#pragma once

#include <drogon/HttpController.h>

namespace s3
{

class ObjectCtrl : public drogon::HttpController<ObjectCtrl>
{
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ObjectCtrl::putObject, "/{bucket}/{key:.*}", drogon::Put,
                  "s3::AuthFilter");
    ADD_METHOD_TO(ObjectCtrl::getObject, "/{bucket}/{key:.*}", drogon::Get,
                  "s3::AuthFilter");
    ADD_METHOD_TO(ObjectCtrl::headObject, "/{bucket}/{key:.*}", drogon::Head,
                  "s3::AuthFilter");
    ADD_METHOD_TO(ObjectCtrl::deleteObject, "/{bucket}/{key:.*}",
                  drogon::Delete, "s3::AuthFilter");
    METHOD_LIST_END

    void putObject(const drogon::HttpRequestPtr&,
                   std::function<void(const drogon::HttpResponsePtr&)>&&,
                   const std::string& bucket, const std::string& key);

    void getObject(const drogon::HttpRequestPtr&,
                   std::function<void(const drogon::HttpResponsePtr&)>&&,
                   const std::string& bucket, const std::string& key);

    void headObject(const drogon::HttpRequestPtr&,
                    std::function<void(const drogon::HttpResponsePtr&)>&&,
                    const std::string& bucket, const std::string& key);

    void deleteObject(const drogon::HttpRequestPtr&,
                      std::function<void(const drogon::HttpResponsePtr&)>&&,
                      const std::string& bucket, const std::string& key);
};

} // namespace s3
