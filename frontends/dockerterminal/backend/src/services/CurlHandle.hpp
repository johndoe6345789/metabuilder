#pragma once

#include <curl/curl.h>

#include <string>

namespace dockerterminal {

// RAII wrapper so a thrown exception (or early return) still cleans up
// the curl easy handle.
struct CurlHandle {
    CURL* curl;
    CurlHandle();
    ~CurlHandle();
    CurlHandle(const CurlHandle&) = delete;
    CurlHandle& operator=(const CurlHandle&) = delete;
};

// libcurl write callback that appends into a std::string.
size_t writeToString(char* ptr, size_t size, size_t nmemb, void* userdata);

} // namespace dockerterminal
