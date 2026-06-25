//! Factory for ConvertToBoolean plugin.

use super::ConvertToBoolean;

/// Creates a new ConvertToBoolean instance.
pub fn create() -> ConvertToBoolean {
    ConvertToBoolean::new()
}
