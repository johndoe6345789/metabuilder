//! Factory for LogicLt plugin.

use super::LogicLt;

/// Creates a new LogicLt instance.
pub fn create() -> LogicLt {
    LogicLt::new()
}
