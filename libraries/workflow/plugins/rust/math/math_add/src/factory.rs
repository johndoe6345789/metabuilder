//! Factory for MathAdd plugin.

use super::MathAdd;

/// Creates a new MathAdd instance.
pub fn create() -> MathAdd {
    MathAdd::new()
}
