//! Factory for StringStartsWith plugin.

use super::StringStartsWith;

/// Creates a new StringStartsWith instance.
pub fn create() -> StringStartsWith {
    StringStartsWith::new()
}
