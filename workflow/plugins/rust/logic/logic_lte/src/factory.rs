//! Factory for LogicLte plugin.

use super::LogicLte;

/// Creates a new LogicLte instance.
pub fn create() -> LogicLte {
    LogicLte::new()
}
