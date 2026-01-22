//! Factory for StringTrim plugin.

use super::StringTrim;

/// Creates a new StringTrim instance.
pub fn create() -> StringTrim {
    StringTrim::new()
}
