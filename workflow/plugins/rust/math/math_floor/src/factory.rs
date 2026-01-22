//! Factory for MathFloor plugin.

use super::MathFloor;

/// Creates a new MathFloor instance.
pub fn create() -> MathFloor {
    MathFloor::new()
}
