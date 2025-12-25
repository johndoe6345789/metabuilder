#include <string>
#include <vector>

namespace dbal {

// Capability detection for database features
class Capabilities {
public:
    static std::vector<std::string> detect(const std::string& adapter) {
        std::vector<std::string> caps;
        
        if (adapter == "sqlite") {
            caps.push_back("crud");
            caps.push_back("transactions");
            caps.push_back("fulltext_search");
        } else if (adapter == "prisma") {
            caps.push_back("crud");
            caps.push_back("transactions");
            caps.push_back("relations");
            caps.push_back("migrations");
        }
        
        return caps;
    }
    
    static bool supports(const std::string& adapter, const std::string& capability) {
        auto caps = detect(adapter);
        for (const auto& cap : caps) {
            if (cap == capability) return true;
        }
        return false;
    }
};

}
