//! Factory for VarGet plugin.

use super::VarGet;

/// Creates a new VarGet instance.
pub fn create() -> VarGet {
    VarGet::new()
}
