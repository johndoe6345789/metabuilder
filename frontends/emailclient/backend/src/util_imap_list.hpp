#pragma once

#include <optional>
#include <string>
#include <vector>

namespace email_backend {

struct ImapListEntry {
    std::string name;
    std::string delimiter;
    std::vector<std::string> flags;
};

/// Parses one line of an IMAP LIST response, e.g.
/// `* LIST (\HasNoChildren) "/" "INBOX"` into {name, delimiter, flags}.
std::optional<ImapListEntry> parseImapListLine(const std::string& line);

} // namespace email_backend
