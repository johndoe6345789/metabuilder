//! Factory for ConvertParseJson plugin.

use super::ConvertParseJson;

/// Creates a new ConvertParseJson instance.
pub fn create() -> ConvertParseJson {
    ConvertParseJson::new()
}
