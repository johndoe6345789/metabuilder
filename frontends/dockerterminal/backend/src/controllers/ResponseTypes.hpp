#pragma once

#include <drogon/HttpResponse.h>

#include <functional>

namespace dockerterminal {

using ResponseCb = std::function<void(const drogon::HttpResponsePtr&)>;

} // namespace dockerterminal
