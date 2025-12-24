#include <thread>
#include <chrono>
#include <algorithm>

namespace dbal {
namespace util {

class ExponentialBackoff {
public:
    ExponentialBackoff(int initial_ms = 100, int max_ms = 30000, double multiplier = 2.0)
        : current_ms_(initial_ms), max_ms_(max_ms), multiplier_(multiplier), attempt_(0) {}
    
    void sleep() {
        std::this_thread::sleep_for(std::chrono::milliseconds(current_ms_));
        
        // Increase backoff time for next attempt
        current_ms_ = std::min(static_cast<int>(current_ms_ * multiplier_), max_ms_);
        attempt_++;
    }
    
    void reset() {
        current_ms_ = 100;
        attempt_ = 0;
    }
    
    int currentMs() const { return current_ms_; }
    int attempt() const { return attempt_; }
    
private:
    int current_ms_;
    int max_ms_;
    double multiplier_;
    int attempt_;
};

}
}
