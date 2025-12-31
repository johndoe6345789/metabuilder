#include <string>
#include <random>
#include <sstream>
#include <iomanip>

namespace dbal {
namespace util {

class UUID {
public:
    static std::string generate() {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> dis(0, 15);
        std::uniform_int_distribution<> dis2(8, 11);
        
        std::stringstream ss;
        int i;
        
        ss << std::hex;
        for (i = 0; i < 8; i++) {
            ss << dis(gen);
        }
        ss << "-";
        
        for (i = 0; i < 4; i++) {
            ss << dis(gen);
        }
        ss << "-4"; // Version 4 UUID
        
        for (i = 0; i < 3; i++) {
            ss << dis(gen);
        }
        ss << "-";
        
        ss << dis2(gen);
        for (i = 0; i < 3; i++) {
            ss << dis(gen);
        }
        ss << "-";
        
        for (i = 0; i < 12; i++) {
            ss << dis(gen);
        }
        
        return ss.str();
    }
    
    static bool isValid(const std::string& uuid) {
        if (uuid.length() != 36) return false;
        
        for (size_t i = 0; i < uuid.length(); i++) {
            if (i == 8 || i == 13 || i == 18 || i == 23) {
                if (uuid[i] != '-') return false;
            } else {
                if (!std::isxdigit(uuid[i])) return false;
            }
        }
        
        return true;
    }
};

}
}
