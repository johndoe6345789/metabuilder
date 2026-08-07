#include "AiProviderClient.hpp"
#include "AiHttpPost.hpp"

#include <nlohmann/json.hpp>

namespace pastebin {

namespace {

nlohmann::json buildChatBody(const std::string& model,
                              const std::string& prompt) {
    nlohmann::json msg;
    msg["role"] = "user";
    msg["content"] = prompt;

    nlohmann::json body;
    body["model"] = model;
    body["messages"] = nlohmann::json::array({msg});
    body["max_tokens"] = 1024;
    return body;
}

CurlSlist buildHeaders(const std::string& apiFormat,
                       const std::string& apiKey) {
    CurlSlist headers;
    headers.append("Content-Type: application/json");
    if (apiFormat == "anthropic") {
        headers.append("x-api-key: " + apiKey);
        headers.append("anthropic-version: 2023-06-01");
    } else {
        headers.append("Authorization: Bearer " + apiKey);
    }
    return headers;
}

std::string extractText(const std::string& apiFormat,
                         const nlohmann::json& parsed) {
    if (apiFormat == "anthropic")
        return parsed.at("content").at(0).at("text").get<std::string>();
    return parsed.at("choices")
        .at(0)
        .at("message")
        .at("content")
        .get<std::string>();
}

} // namespace

AiAnalyzeResult callAiProvider(const std::string& apiFormat,
                                const std::string& endpoint,
                                const std::string& model,
                                const std::string& apiKey,
                                const std::string& prompt) {
    AiAnalyzeResult result;
    const auto headers = buildHeaders(apiFormat, apiKey);
    const auto body = buildChatBody(model, prompt);
    const auto raw = httpPostJson(endpoint, headers, body.dump());

    if (raw.status < 200 || raw.status >= 300) {
        result.error = "AI provider request failed (HTTP " +
                        std::to_string(raw.status) + "): " + raw.body;
        return result;
    }

    try {
        result.text = extractText(apiFormat, nlohmann::json::parse(raw.body));
        result.ok = true;
    } catch (const std::exception& e) {
        result.error =
            std::string("Unexpected AI provider response: ") + e.what();
    }
    return result;
}

} // namespace pastebin
