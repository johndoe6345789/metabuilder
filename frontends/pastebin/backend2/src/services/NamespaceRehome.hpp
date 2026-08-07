#pragma once

#include <string>

namespace pastebin {

/// Finds the id of `userId`'s default namespace, excluding `excludeId`.
/// Returns "" if none is found.
std::string findDefaultNamespaceId(const std::string& userId,
                                    const std::string& excludeId);

/// Moves every snippet in `namespaceId` owned by `userId` into
/// `defaultNsId`. Returns false if any move fails.
bool rehomeSnippets(const std::string& namespaceId, const std::string& userId,
                     const std::string& defaultNsId);

} // namespace pastebin
