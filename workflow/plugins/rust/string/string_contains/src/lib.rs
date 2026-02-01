//! Workflow plugin: string contains.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// StringContains implements the NodeExecutor trait for checking if string contains substring.
pub struct StringContains {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl StringContains {
    /// Creates a new StringContains instance.
    pub fn new() -> Self {
        Self {
            node_type: "string.contains",
            category: "string",
            description: "Check if string contains substring",
        }
    }
}

impl Default for StringContains {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for StringContains {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let string: String = inputs
            .get("string")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();
        let substring: String = inputs
            .get("substring")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(string.contains(&substring)));
        result
    }
}

/// Creates a new StringContains instance.
pub fn create() -> StringContains {
    StringContains::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_contains() {
        let executor = StringContains::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("hello world"));
        inputs.insert("substring".to_string(), serde_json::json!("world"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "string.contains");
        assert_eq!(executor.category, "string");
    }
}
