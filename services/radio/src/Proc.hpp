#pragma once
#include <string>
#include <vector>
#include <sys/types.h>

struct Proc {
    pid_t pid{-1};

    Proc() = default;
    Proc(const Proc&) = delete;
    Proc& operator=(const Proc&) = delete;
    Proc(Proc&& o) noexcept : pid(o.pid) { o.pid = -1; }
    Proc& operator=(Proc&& o) noexcept {
        stop(); pid = o.pid; o.pid = -1; return *this;
    }
    ~Proc() { stop(); }

    static Proc spawn(std::vector<std::string> args);
    bool alive() const;
    void stop();
};
