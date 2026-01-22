//! Factory for ConvertToObject plugin.

use super::ConvertToObject;

/// Creates a new ConvertToObject instance.
pub fn create() -> ConvertToObject {
    ConvertToObject::new()
}
