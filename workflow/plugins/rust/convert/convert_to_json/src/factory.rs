//! Factory for ConvertToJson plugin.

use super::ConvertToJson;

/// Creates a new ConvertToJson instance.
pub fn create() -> ConvertToJson {
    ConvertToJson::new()
}
