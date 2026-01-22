//! Factory for ListReverse plugin.

use super::ListReverse;

/// Creates a new ListReverse instance.
pub fn create() -> ListReverse {
    ListReverse::new()
}
