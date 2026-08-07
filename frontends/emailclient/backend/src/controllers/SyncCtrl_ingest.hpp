#pragma once

#include "../services/ImapClient.hpp"

#include <string>
#include <vector>

namespace email_backend {

struct IngestResult {
    int newCount = 0;
    long maxUid = 0;
};

/// Inserts any not-yet-seen fetched messages into email_messages, returning
/// the count of new messages and the highest UID seen (>= lastUid).
IngestResult ingestFetchedMessages(int accountId, const std::string& tenant,
                                    const std::vector<FetchedMessage>& fetched,
                                    long lastUid);

void markSyncStatus(int accountId, const std::string& status);

} // namespace email_backend
