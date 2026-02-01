//! Factory for ListSlice plugin.

use super::ListSlice;

/// Creates a new ListSlice instance.
pub fn create() -> ListSlice {
    ListSlice::new()
}
