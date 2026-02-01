//! Factory for StringLower plugin.

use super::StringLower;

/// Creates a new StringLower instance.
pub fn create() -> StringLower {
    StringLower::new()
}
