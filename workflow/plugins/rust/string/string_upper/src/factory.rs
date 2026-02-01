//! Factory for StringUpper plugin.

use super::StringUpper;

/// Creates a new StringUpper instance.
pub fn create() -> StringUpper {
    StringUpper::new()
}
