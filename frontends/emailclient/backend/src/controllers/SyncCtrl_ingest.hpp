#pragma once

#include "../services/ImapClient.hpp"

#include <string>
#include <vector>

namespace email_backend {

struct IngestResult {
    int newCount = 0;
    long maxUid = 0;
};

/// Batch-inserts any not-yet-seen fetched messages into the DBAL
/// EmailMessage entity (folder `folderId`, account `emailClientId`) via
/// DBAL's `_batch` endpoint, returning the count of new messages and the
/// highest UID seen (>= lastUid). Dedupes against imapUid values already
/// present in the folder.
IngestResult ingestFetchedMessages(const std::string& emailClientId,
                                    const std::string& folderId,
                                    const std::vector<FetchedMessage>& fetched,
                                    long lastUid);

/// Flips EmailClient.isSyncing for `emailClientId`.
void markSyncing(const std::string& emailClientId, bool syncing);

} // namespace email_backend
