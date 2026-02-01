//! Factory for VarSet plugin.

use super::VarSet;

/// Creates a new VarSet instance.
pub fn create() -> VarSet {
    VarSet::new()
}
