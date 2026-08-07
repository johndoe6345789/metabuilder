#include "DbalClient_method.hpp"

#include <cctype>

namespace pastebin {

std::string toUpperAscii(std::string s) {
    for (auto& c : s)
        c = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
    return s;
}

void applyHttpMethod(CURL* curl, const std::string& upperMethod,
                      const nlohmann::json* jsonBody,
                      const std::string& bodyText) {
    if (jsonBody) {
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, bodyText.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE,
                          static_cast<long>(bodyText.size()));
    }
    if (upperMethod == "GET") {
        curl_easy_setopt(curl, CURLOPT_HTTPGET, 1L);
    } else if (upperMethod == "POST") {
        curl_easy_setopt(curl, CURLOPT_POST, 1L);
        if (!jsonBody)
            curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, 0L);
    } else {
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, upperMethod.c_str());
        if (jsonBody)
            curl_easy_setopt(curl, CURLOPT_POST, 1L);
    }
}

} // namespace pastebin
