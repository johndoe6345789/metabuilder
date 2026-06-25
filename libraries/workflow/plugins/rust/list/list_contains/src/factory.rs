//! Factory for ListContains plugin.

use super::ListContains;

/// Creates a new ListContains instance.
pub fn create() -> ListContains {
    ListContains::new()
}
