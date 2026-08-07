#pragma once

#include <string>

namespace pastebin {

/// Creates a SnippetRevision if `code`/`filesJson` differ from the most
/// recently saved revision for this snippet. `filesJson` should already
/// be serialized (or empty for "no files").
void maybeSaveRevision(const std::string& snippetId, const std::string& code,
                        const std::string& filesJson,
                        const std::string& userId);

} // namespace pastebin
