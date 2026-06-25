//! Factory for ConvertToNumber plugin.

use super::ConvertToNumber;

/// Creates a new ConvertToNumber instance.
pub fn create() -> ConvertToNumber {
    ConvertToNumber::new()
}
