#pragma once

#include <string>
#include <vector>

namespace pastebin {

/// Builds one DAP frame ("Content-Length: N\r\n\r\n" + body) for `body`.
std::string buildDapFrame(const std::string& body);

/// Incremental DAP message reader: feed() returns any complete message
/// bodies found in the buffer so far, matching the old Flask
/// `_read_loop`'s Content-Length framing -- a header block with no
/// Content-Length is skipped rather than treated as fatal.
class DapFrameReader {
  public:
    std::vector<std::string> feed(const std::string& chunk);

  private:
    std::string buf_;
};

} // namespace pastebin
