//! Factory for ListConcat plugin.

use super::ListConcat;

/// Creates a new ListConcat instance.
pub fn create() -> ListConcat {
    ListConcat::new()
}
