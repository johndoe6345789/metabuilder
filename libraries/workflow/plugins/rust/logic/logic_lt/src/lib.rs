//! Workflow plugin: less than comparison.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// LogicLt implements the NodeExecutor trait for less than comparison.
pub struct LogicLt {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl LogicLt {
    /// Creates a new LogicLt instance.
    pub fn new() -> Self {
        Self {
            node_type: "logic.lt",
            category: "logic",
            description: "Check if a < b",
        }
    }
}

impl Default for LogicLt {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for LogicLt {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let a: f64 = inputs
            .get("a")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(0.0);
        let b: f64 = inputs
            .get("b")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(0.0);

        let mut output = HashMap::new();
        output.insert("result".to_string(), serde_json::json!(a < b));
        output
    }
}

/// Creates a new LogicLt instance.
pub fn create() -> LogicLt {
    LogicLt::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lt_true() {
        let executor = LogicLt::new();
        let mut inputs = HashMap::new();
        inputs.insert("a".to_string(), serde_json::json!(5.0));
        inputs.insert("b".to_string(), serde_json::json!(10.0));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_lt_false() {
        let executor = LogicLt::new();
        let mut inputs = HashMap::new();
        inputs.insert("a".to_string(), serde_json::json!(10.0));
        inputs.insert("b".to_string(), serde_json::json!(5.0));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(false)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "logic.lt");
        assert_eq!(executor.category, "logic");
    }
}
