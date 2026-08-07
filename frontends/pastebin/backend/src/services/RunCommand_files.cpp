#include "RunCommand.hpp"

#include <jwt-cpp/base.h>

namespace pastebin {

std::string makeContainerFilesEnv(const std::vector<SourceFile>& files) {
    std::string raw;
    for (const auto& f : files) {
        if (!raw.empty())
            raw += '\x1e';
        raw += f.name;
        raw += '\x1f';
        raw += f.content;
    }
    return "FILES_PAYLOAD=" + jwt::base::encode<jwt::alphabet::base64>(raw);
}

const char* fileWriterShellSnippet() {
    return R"(mkdir -p /workspace && echo "$FILES_PAYLOAD" | base64 -d | )"
           R"(awk 'BEGIN{RS="\x1e";FS="\x1f"})"
           R"({if(NF>=2 && length($1)>0){f="/workspace/"$1;print $2>f;close(f)}}')";
}

} // namespace pastebin
