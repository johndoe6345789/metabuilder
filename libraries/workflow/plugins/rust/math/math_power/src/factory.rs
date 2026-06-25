//! Factory for MathPower plugin.

use super::MathPower;

/// Creates a new MathPower instance.
pub fn create() -> MathPower {
    MathPower::new()
}
