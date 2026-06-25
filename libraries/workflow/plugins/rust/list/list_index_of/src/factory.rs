//! Factory for ListIndexOf plugin.

use super::ListIndexOf;

/// Creates a new ListIndexOf instance.
pub fn create() -> ListIndexOf {
    ListIndexOf::new()
}
