//! Factory for StringConcat plugin.

use super::StringConcat;

/// Creates a new StringConcat instance.
pub fn create() -> StringConcat {
    StringConcat::new()
}
