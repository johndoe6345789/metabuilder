//! Workflow plugin: equals comparison.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// LogicEquals implements the NodeExecutor trait for equality comparison.
pub struct LogicEquals {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl LogicEquals {
    /// Creates a new LogicEquals instance.
    pub fn new() -> Self {
        Self {
            node_type: "logic.equals",
            category: "logic",
            description: "Check if two values are equal",
        }
    }
}

impl Default for LogicEquals {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for LogicEquals {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let a = inputs.get("a").unwrap_or(&Value::Null);
        let b = inputs.get("b").unwrap_or(&Value::Null);

        let mut output = HashMap::new();
        output.insert("result".to_string(), serde_json::json!(a == b));
        output
    }
}

/// Creates a new LogicEquals instance.
pub fn create() -> LogicEquals {
    LogicEquals::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_equals_true() {
        let executor = LogicEquals::new();
        let mut inputs = HashMap::new();
        inputs.insert("a".to_string(), serde_json::json!(5));
        inputs.insert("b".to_string(), serde_json::json!(5));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_equals_false() {
        let executor = LogicEquals::new();
        let mut inputs = HashMap::new();
        inputs.insert("a".to_string(), serde_json::json!(5));
        inputs.insert("b".to_string(), serde_json::json!(10));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(false)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "logic.equals");
        assert_eq!(executor.category, "logic");
    }
}
