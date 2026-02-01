//! Factory for ConvertToString plugin.

use super::ConvertToString;

/// Creates a new ConvertToString instance.
pub fn create() -> ConvertToString {
    ConvertToString::new()
}
