//! Factory for StringLength plugin.

use super::StringLength;

/// Creates a new StringLength instance.
pub fn create() -> StringLength {
    StringLength::new()
}
