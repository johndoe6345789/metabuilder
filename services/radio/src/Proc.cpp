#include "Proc.hpp"
#include <csignal>
#include <fcntl.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdexcept>

Proc Proc::spawn(std::vector<std::string> args) {
    std::vector<char*> argv;
    argv.reserve(args.size() + 1);
    for (auto& a : args) argv.push_back(const_cast<char*>(a.c_str()));
    argv.push_back(nullptr);

    pid_t pid = fork();
    if (pid < 0) throw std::runtime_error("fork failed");

    if (pid == 0) {
        int null = open("/dev/null", O_WRONLY);
        if (null >= 0) {
            dup2(null, STDERR_FILENO);
            dup2(null, STDOUT_FILENO);
            close(null);
        }
        execvp(argv[0], argv.data());
        _exit(127);
    }
    Proc result;
    result.pid = pid;
    return result;
}

bool Proc::alive() const {
    if (pid <= 0) return false;
    int st;
    return waitpid(pid, &st, WNOHANG) == 0;
}

void Proc::stop() {
    if (pid <= 0) return;
    kill(pid, SIGTERM);
    int st;
    waitpid(pid, &st, 0);
    pid = -1;
}
