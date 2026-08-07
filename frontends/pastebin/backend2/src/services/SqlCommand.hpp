#pragma once

#include <string>
#include <vector>

namespace pastebin {

struct SqlCommand {
    std::vector<std::string> cmd;
    std::vector<std::string> env; // "KEY=VALUE" entries
    bool networkDisabled = false;
};

} // namespace pastebin
