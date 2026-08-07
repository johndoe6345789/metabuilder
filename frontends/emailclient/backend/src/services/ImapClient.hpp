#pragma once

#include "../util_imap_fetch.hpp"
#include "../util_imap_list.hpp"

#include <string>
#include <vector>

namespace email_backend {

struct ImapConfig {
    std::string host;
    int port = 993;
    std::string encryption = "tls"; // "tls" (implicit SSL), "starttls", "none"
    std::string username;
    std::string password;
};

/// Thin libcurl wrapper around the subset of IMAP this service needs:
/// listing folders and fetching new messages since a UID watermark. Talks
/// to the server via curl's native imap(s):// URL support, which handles
/// the TLS/STARTTLS handshake and AUTH exchange for us.
class ImapClient {
  public:
    explicit ImapClient(ImapConfig config);

    std::vector<ImapListEntry> listFolders();

    /// UID FETCHes everything newer than `lastUid` (or everything, if 0)
    /// from INBOX.
    std::vector<FetchedMessage> fetchNew(long lastUid);

  private:
    ImapConfig config_;
};

} // namespace email_backend
