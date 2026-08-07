#pragma once

#include "util_imap_fetch.hpp"

#include <string>

namespace email_backend {

/// Consumes the parenthesized body of one IMAP FETCH response record
/// starting just after '(' at `parenPos`, tracking paren-nesting depth (so
/// inner groups like `FLAGS (\Seen)` don't end the record early) and
/// `{N}` byte-counted literals (which may contain any bytes, including
/// text that looks like IMAP syntax). Non-literal text accumulates in
/// `meta` for the caller to parse UID/FLAGS from; literal bytes are
/// written directly into `rec`. Returns the position just past the
/// record's closing ')'.
size_t consumeRecordBody(const std::string& raw, size_t parenPos,
                          FetchedMessage& rec, std::string& meta);

} // namespace email_backend
