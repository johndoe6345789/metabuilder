#pragma once

#include <string>

namespace pastebin {

/// Writes all of `data` to `fd`. Returns false on any send() failure
/// (e.g. the peer closed the connection) instead of throwing -- callers
/// decide whether that's fatal or just means the session is gone.
bool sendAll(int fd, const std::string& data);

} // namespace pastebin
