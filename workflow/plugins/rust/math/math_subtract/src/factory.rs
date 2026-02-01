//! Factory for MathSubtract plugin.

use super::MathSubtract;

/// Creates a new MathSubtract instance.
pub fn create() -> MathSubtract {
    MathSubtract::new()
}
