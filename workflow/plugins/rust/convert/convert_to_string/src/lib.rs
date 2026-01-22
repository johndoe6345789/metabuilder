//! Workflow plugin: convert to string.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ConvertToString implements the NodeExecutor trait for string conversion.
pub struct ConvertToString {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ConvertToString {
    /// Creates a new ConvertToString instance.
    pub fn new() -> Self {
        Self {
            node_type: "convert.to_string",
            category: "convert",
            description: "Convert value to string",
        }
    }
}

impl Default for ConvertToString {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ConvertToString {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let value = inputs.get("value").unwrap_or(&Value::Null);

        let result = match value {
            Value::String(s) => s.clone(),
            Value::Null => String::new(),
            _ => serde_json::to_string(value).unwrap_or_default(),
        };

        let mut output = HashMap::new();
        output.insert("result".to_string(), serde_json::json!(result));
        output
    }
}

/// Creates a new ConvertToString instance.
pub fn create() -> ConvertToString {
    ConvertToString::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_string_number() {
        let executor = ConvertToString::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(42));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!("42")));
    }

    #[test]
    fn test_to_string_already_string() {
        let executor = ConvertToString::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!("hello"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!("hello")));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "convert.to_string");
        assert_eq!(executor.category, "convert");
    }
}
