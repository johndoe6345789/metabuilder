//! Factory for ListAt plugin.

use super::ListAt;

/// Creates a new ListAt instance.
pub fn create() -> ListAt {
    ListAt::new()
}
