#include "InteractivePreamble.hpp"

namespace pastebin {

const char* interactiveInputPreamble() {
    return
        "def __isinp():\n"
        "    import sys as _s, builtins as _b\n"
        "    _ps = '\\x00PROMPT:'\n"
        "    _pe = '\\x00'\n"
        "    def _inp(prompt='', _sys=_s, _p0=_ps, _p1=_pe):\n"
        "        _sys.stdout.write(_p0 + str(prompt) + _p1 + '\\n')\n"
        "        _sys.stdout.flush()\n"
        "        return _sys.stdin.readline().rstrip('\\n')\n"
        "    _b.input = _inp\n"
        "    del _b, _s, _ps, _pe, _inp\n"
        "__isinp()\n"
        "del __isinp\n";
}

std::vector<SourceFile> injectInteractivePreamble(
    const std::vector<SourceFile>& files, const std::string& entryPoint) {
    std::vector<SourceFile> out = files;
    for (auto& f : out) {
        if (f.name == entryPoint) {
            f.content = std::string(interactiveInputPreamble()) + "\n" +
                        f.content;
            break;
        }
    }
    return out;
}

} // namespace pastebin
