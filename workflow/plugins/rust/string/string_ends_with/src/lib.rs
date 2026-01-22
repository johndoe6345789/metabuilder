//! Workflow plugin: string ends with.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// StringEndsWith implements the NodeExecutor trait for checking if string ends with suffix.
pub struct StringEndsWith {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl StringEndsWith {
    /// Creates a new StringEndsWith instance.
    pub fn new() -> Self {
        Self {
            node_type: "string.ends_with",
            category: "string",
            description: "Check if string ends with suffix",
        }
    }
}

impl Default for StringEndsWith {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for StringEndsWith {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let string: String = inputs
            .get("string")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();
        let suffix: String = inputs
            .get("suffix")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(string.ends_with(&suffix)));
        result
    }
}

/// Creates a new StringEndsWith instance.
pub fn create() -> StringEndsWith {
    StringEndsWith::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ends_with() {
        let executor = StringEndsWith::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("hello world"));
        inputs.insert("suffix".to_string(), serde_json::json!("world"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "string.ends_with");
        assert_eq!(executor.category, "string");
    }
}
