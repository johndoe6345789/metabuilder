//! Workflow plugin: logical OR.

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

/// LogicOr implements the NodeExecutor trait for logical OR operations.
pub struct LogicOr {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl LogicOr {
    /// Creates a new LogicOr instance.
    pub fn new() -> Self {
        Self {
            node_type: "logic.or",
            category: "logic",
            description: "Logical OR on boolean values",
        }
    }
}

impl Default for LogicOr {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for LogicOr {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let values: Vec<Value> = inputs
            .get("values")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let result = values.iter().any(to_bool);

        let mut output = HashMap::new();
        output.insert("result".to_string(), serde_json::json!(result));
        output
    }
}

/// Creates a new LogicOr instance.
pub fn create() -> LogicOr {
    LogicOr::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_or() {
        let executor = LogicOr::new();
        let mut inputs = HashMap::new();
        inputs.insert("values".to_string(), serde_json::json!([false, true, false]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_or_all_false() {
        let executor = LogicOr::new();
        let mut inputs = HashMap::new();
        inputs.insert("values".to_string(), serde_json::json!([false, false, false]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(false)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "logic.or");
        assert_eq!(executor.category, "logic");
    }
}
