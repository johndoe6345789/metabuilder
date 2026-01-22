//! Factory for StringEndsWith plugin.

use super::StringEndsWith;

/// Creates a new StringEndsWith instance.
pub fn create() -> StringEndsWith {
    StringEndsWith::new()
}
