//! Factory for ListLength plugin.

use super::ListLength;

/// Creates a new ListLength instance.
pub fn create() -> ListLength {
    ListLength::new()
}
