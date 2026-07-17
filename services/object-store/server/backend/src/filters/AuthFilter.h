/**
 * @file AuthFilter.h
 * @brief Simple access-key authentication for S3.
 */

#pragma once

#include <drogon/HttpFilter.h>

namespace s3
{

/// @brief Validates Authorization header access key.
///        Sets "access_key" attribute on the request.
class AuthFilter : public drogon::HttpFilter<AuthFilter>
{
  public:
    void doFilter(const drogon::HttpRequestPtr& req,
                  drogon::FilterCallback&& cb,
                  drogon::FilterChainCallback&& ccb) override;
};

} // namespace s3
