//! Factory for MathAbs plugin.

use super::MathAbs;

/// Creates a new MathAbs instance.
pub fn create() -> MathAbs {
    MathAbs::new()
}
