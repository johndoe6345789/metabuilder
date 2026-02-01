//! Factory for ListSort plugin.

use super::ListSort;

/// Creates a new ListSort instance.
pub fn create() -> ListSort {
    ListSort::new()
}
