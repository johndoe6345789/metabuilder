#include "DbalClient.hpp"

namespace email_backend {

std::vector<nlohmann::json> dbalAllPages(const std::string& pathWithParams,
                                          int limit) {
    std::vector<nlohmann::json> results;
    int page = 1;
    const char sep = pathWithParams.find('?') != std::string::npos ? '&' : '?';

    while (true) {
        const std::string path = pathWithParams + sep +
                                  "limit=" + std::to_string(limit) +
                                  "&page=" + std::to_string(page);
        const auto r = dbalRequest("GET", path);
        if (!r || !r->ok())
            break;

        const auto payload = r->body.value("data", nlohmann::json::object());
        const auto batch = payload.value("data", nlohmann::json::array());
        for (const auto& item : batch)
            results.push_back(item);

        const int total = payload.value("total", 0);
        if (static_cast<int>(results.size()) >= total)
            break;
        page++;
    }
    return results;
}

} // namespace email_backend
