//! Workflow plugin: greater than comparison.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// LogicGt implements the NodeExecutor trait for greater than comparison.
pub struct LogicGt {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl LogicGt {
    /// Creates a new LogicGt instance.
    pub fn new() -> Self {
        Self {
            node_type: "logic.gt",
            category: "logic",
            description: "Check if a > b",
        }
    }
}

impl Default for LogicGt {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for LogicGt {
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
        output.insert("result".to_string(), serde_json::json!(a > b));
        output
    }
}

/// Creates a new LogicGt instance.
pub fn create() -> LogicGt {
    LogicGt::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gt_true() {
        let executor = LogicGt::new();
        let mut inputs = HashMap::new();
        inputs.insert("a".to_string(), serde_json::json!(10.0));
        inputs.insert("b".to_string(), serde_json::json!(5.0));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_gt_false() {
        let executor = LogicGt::new();
        let mut inputs = HashMap::new();
        inputs.insert("a".to_string(), serde_json::json!(5.0));
        inputs.insert("b".to_string(), serde_json::json!(10.0));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(false)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "logic.gt");
        assert_eq!(executor.category, "logic");
    }
}
