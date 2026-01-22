//! Factory for StringSplit plugin.

use super::StringSplit;

/// Creates a new StringSplit instance.
pub fn create() -> StringSplit {
    StringSplit::new()
}
