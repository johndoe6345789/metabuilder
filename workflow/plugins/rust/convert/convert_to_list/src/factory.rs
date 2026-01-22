//! Factory for ConvertToList plugin.

use super::ConvertToList;

/// Creates a new ConvertToList instance.
pub fn create() -> ConvertToList {
    ConvertToList::new()
}
