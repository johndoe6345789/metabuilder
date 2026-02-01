//! Factory for MathDivide plugin.

use super::MathDivide;

/// Creates a new MathDivide instance.
pub fn create() -> MathDivide {
    MathDivide::new()
}
