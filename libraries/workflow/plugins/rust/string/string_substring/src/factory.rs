//! Factory for StringSubstring plugin.

use super::StringSubstring;

/// Creates a new StringSubstring instance.
pub fn create() -> StringSubstring {
    StringSubstring::new()
}
