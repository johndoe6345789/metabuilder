#include <string>
#include <algorithm>
#include <cctype>

namespace dbal {
namespace query {

class QueryNormalizer {
public:
    static std::string normalize(const std::string& query) {
        std::string normalized = query;
        
        // Convert to uppercase
        std::transform(normalized.begin(), normalized.end(), normalized.begin(),
            [](unsigned char c) { return std::toupper(c); });
        
        // Remove extra whitespace
        normalized = removeExtraWhitespace(normalized);
        
        return normalized;
    }
    
private:
    static std::string removeExtraWhitespace(const std::string& str) {
        std::string result;
        bool lastWasSpace = false;
        
        for (char c : str) {
            if (std::isspace(c)) {
                if (!lastWasSpace) {
                    result += ' ';
                    lastWasSpace = true;
                }
            } else {
                result += c;
                lastWasSpace = false;
            }
        }
        
        // Trim leading/trailing spaces
        size_t start = result.find_first_not_of(' ');
        size_t end = result.find_last_not_of(' ');
        
        if (start != std::string::npos && end != std::string::npos) {
            return result.substr(start, end - start + 1);
        }
        
        return result;
    }
};

}
}
