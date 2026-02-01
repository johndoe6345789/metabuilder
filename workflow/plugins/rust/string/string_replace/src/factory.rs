//! Factory for StringReplace plugin.

use super::StringReplace;

/// Creates a new StringReplace instance.
pub fn create() -> StringReplace {
    StringReplace::new()
}
