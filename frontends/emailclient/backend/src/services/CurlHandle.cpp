#include "CurlHandle.hpp"

#include <stdexcept>

namespace email_backend {

CurlHandle::CurlHandle() : curl(curl_easy_init()) {
    if (!curl)
        throw std::runtime_error("curl_easy_init failed");
}

CurlHandle::~CurlHandle() {
    curl_easy_cleanup(curl);
}

CurlSlist::~CurlSlist() {
    curl_slist_free_all(list);
}

void CurlSlist::append(const std::string& value) {
    list = curl_slist_append(list, value.c_str());
}

size_t writeToString(char* ptr, size_t size, size_t nmemb, void* userdata) {
    auto* out = static_cast<std::string*>(userdata);
    out->append(ptr, size * nmemb);
    return size * nmemb;
}

} // namespace email_backend
