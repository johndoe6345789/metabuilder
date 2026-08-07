#pragma once

#include <curl/curl.h>

#include <string>

namespace pastebin {

// RAII wrapper so a thrown exception (or early return) still cleans up
// the curl easy handle.
struct CurlHandle {
    CURL* curl;
    CurlHandle();
    ~CurlHandle();
    CurlHandle(const CurlHandle&) = delete;
    CurlHandle& operator=(const CurlHandle&) = delete;
};

// RAII wrapper around a curl_slist (e.g. headers).
struct CurlSlist {
    curl_slist* list = nullptr;
    ~CurlSlist();
    void append(const std::string& value);
};

// libcurl write callback that appends into a std::string.
size_t writeToString(char* ptr, size_t size, size_t nmemb, void* userdata);

} // namespace pastebin
