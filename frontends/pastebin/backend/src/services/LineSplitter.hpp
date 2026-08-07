#pragma once

#include <optional>
#include <string>
#include <vector>

namespace pastebin {

/// Buffers text fed incrementally and yields complete '\n'-terminated
/// lines (delimiter stripped), holding any trailing partial line for the
/// next feed() -- or for a final flush() once the stream has closed.
class LineSplitter {
  public:
    std::vector<std::string> feed(const std::string& text);
    std::optional<std::string> flush();

  private:
    std::string buf_;
};

} // namespace pastebin
