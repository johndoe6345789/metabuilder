#pragma once

#include <string>

namespace pastebin {

struct AiAnalyzeResult {
    bool ok = false;
    std::string text;  // completion text on success
    std::string error; // message on failure
};

/// Calls an OpenAI- or Anthropic-compatible chat-completion endpoint with
/// `prompt` and returns the model's text reply. Mirrors the old Flask
/// `ai_analyze` proxy's two request/response shapes.
AiAnalyzeResult callAiProvider(const std::string& apiFormat,
                                const std::string& endpoint,
                                const std::string& model,
                                const std::string& apiKey,
                                const std::string& prompt);

} // namespace pastebin
