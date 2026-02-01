//! Workflow plugin: convert to list.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ConvertToList implements the NodeExecutor trait for list conversion.
pub struct ConvertToList {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ConvertToList {
    /// Creates a new ConvertToList instance.
    pub fn new() -> Self {
        Self {
            node_type: "convert.to_list",
            category: "convert",
            description: "Convert value to list",
        }
    }
}

impl Default for ConvertToList {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ConvertToList {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let value = inputs.get("value").unwrap_or(&Value::Null);

        let result = match value {
            Value::Array(a) => a.clone(),
            Value::String(s) => s.chars().map(|c| Value::String(c.to_string())).collect(),
            Value::Null => vec![],
            _ => vec![value.clone()],
        };

        let mut output = HashMap::new();
        output.insert("result".to_string(), serde_json::json!(result));
        output
    }
}

/// Creates a new ConvertToList instance.
pub fn create() -> ConvertToList {
    ConvertToList::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_list_string() {
        let executor = ConvertToList::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!("abc"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(["a", "b", "c"])));
    }

    #[test]
    fn test_to_list_single_value() {
        let executor = ConvertToList::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(42));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!([42])));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "convert.to_list");
        assert_eq!(executor.category, "convert");
    }
}
