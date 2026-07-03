/**
 * @file ListCtrl.h
 * @brief S3 ListObjectsV2 endpoint.
 */

#pragma once

#include <drogon/HttpController.h>

namespace s3
{

/// @brief Handles GET /list/{bucket}?prefix=&max-keys=
class ListCtrl : public drogon::HttpController<ListCtrl>
{
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ListCtrl::listObjects, "/list/{bucket}", drogon::Get,
                  "s3::AuthFilter");
    METHOD_LIST_END

    void listObjects(const drogon::HttpRequestPtr&,
                     std::function<void(const drogon::HttpResponsePtr&)>&&,
                     const std::string& bucket);
};

} // namespace s3
