#pragma once

#include <optional>
#include <string>
#include <vector>

namespace email_backend {

std::string envOr(const char* name, const std::string& fallback);
int envInt(const char* name, int fallback);
std::string nowIso();

/// Splits a comma-separated address list (e.g. compose "cc"/"bcc" fields)
/// into trimmed, non-empty entries.
std::vector<std::string> splitAddressList(const std::string& csv);

/// Extracts a single header's unfolded value from a raw RFC 2822 header
/// block, as returned by IMAP `BODY.PEEK[HEADER]`. Case-insensitive on the
/// header name. Returns "" if the header is absent.
std::string extractHeader(const std::string& rawHeaders, const std::string& name);

struct MimeMessage {
    std::string from;
    std::string to;
    std::string subject;
    std::string cc;       // optional, empty = omit
    std::string replyTo;  // optional, empty = omit
    std::string bodyText;
    std::string bodyHtml; // optional; when set, builds multipart/alternative
};

/// Builds a full RFC822 message (headers + body) ready for SMTP DATA upload.
std::string buildMimeMessage(const MimeMessage& msg, const std::string& boundary);

struct ImapListEntry {
    std::string name;
    std::string delimiter;
    std::vector<std::string> flags;
};

/// Parses one line of an IMAP LIST response, e.g.
/// `* LIST (\HasNoChildren) "/" "INBOX"` into {name, delimiter, flags}.
std::optional<ImapListEntry> parseImapListLine(const std::string& line);

struct FetchedMessage {
    long uid = 0;
    bool seen = false;
    std::string rawHeaders;
    std::string bodyText;
};

/// Parses a raw multi-message IMAP UID FETCH response (as returned verbatim
/// by curl for `(FLAGS BODY.PEEK[HEADER] BODY.PEEK[TEXT])`) into individual
/// message records. Literal-aware: `{N}` byte-counted literals may contain
/// any bytes, including characters that look like IMAP syntax, so this
/// tracks an absolute byte cursor rather than scanning line by line.
std::vector<FetchedMessage> parseFetchResponse(const std::string& raw);

} // namespace email_backend
