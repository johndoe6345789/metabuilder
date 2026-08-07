#include "CurlHandle.hpp"

#include <stdexcept>

namespace dockerterminal {

CurlHandle::CurlHandle() : curl(curl_easy_init()) {
    if (!curl)
        throw std::runtime_error("curl_easy_init failed");
}

CurlHandle::~CurlHandle() {
    curl_easy_cleanup(curl);
}

size_t writeToString(char* ptr, size_t size, size_t nmemb, void* userdata) {
    auto* out = static_cast<std::string*>(userdata);
    out->append(ptr, size * nmemb);
    return size * nmemb;
}

} // namespace dockerterminal
