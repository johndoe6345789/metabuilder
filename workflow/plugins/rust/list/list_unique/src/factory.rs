//! Factory for ListUnique plugin.

use super::ListUnique;

/// Creates a new ListUnique instance.
pub fn create() -> ListUnique {
    ListUnique::new()
}
