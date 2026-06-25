//! Workflow plugin: logical NOT.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// Helper to convert Value to bool.
fn to_bool(v: &Value) -> bool {
    match v {
        Value::Bool(b) => *b,
        Value::Number(n) => n.as_f64().map(|f| f != 0.0).unwrap_or(false),
        Value::String(s) => !s.is_empty(),
        Value::Null => false,
        Value::Array(a) => !a.is_empty(),
        Value::Object(o) => !o.is_empty(),
    }
}

/// LogicNot implements the NodeExecutor trait for logical NOT operations.
pub struct LogicNot {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl LogicNot {
    /// Creates a new LogicNot instance.
    pub fn new() -> Self {
        Self {
            node_type: "logic.not",
            category: "logic",
            description: "Logical NOT on a boolean value",
        }
    }
}

impl Default for LogicNot {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for LogicNot {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let value = inputs.get("value").unwrap_or(&Value::Null);

        let mut output = HashMap::new();
        output.insert("result".to_string(), serde_json::json!(!to_bool(value)));
        output
    }
}

/// Creates a new LogicNot instance.
pub fn create() -> LogicNot {
    LogicNot::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_not_true() {
        let executor = LogicNot::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(true));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(false)));
    }

    #[test]
    fn test_not_false() {
        let executor = LogicNot::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(false));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "logic.not");
        assert_eq!(executor.category, "logic");
    }
}
