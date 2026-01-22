//! Factory for StringContains plugin.

use super::StringContains;

/// Creates a new StringContains instance.
pub fn create() -> StringContains {
    StringContains::new()
}
