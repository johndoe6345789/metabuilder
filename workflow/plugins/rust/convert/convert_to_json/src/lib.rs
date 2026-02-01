//! Workflow plugin: convert to JSON string.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ConvertToJson implements the NodeExecutor trait for JSON string conversion.
pub struct ConvertToJson {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ConvertToJson {
    /// Creates a new ConvertToJson instance.
    pub fn new() -> Self {
        Self {
            node_type: "convert.to_json",
            category: "convert",
            description: "Convert value to JSON string",
        }
    }
}

impl Default for ConvertToJson {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ConvertToJson {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let value = inputs.get("value").unwrap_or(&Value::Null);
        let pretty: bool = inputs
            .get("pretty")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(false);

        let result = if pretty {
            serde_json::to_string_pretty(value).unwrap_or_default()
        } else {
            serde_json::to_string(value).unwrap_or_default()
        };

        let mut output = HashMap::new();
        output.insert("result".to_string(), serde_json::json!(result));
        output
    }
}

/// Creates a new ConvertToJson instance.
pub fn create() -> ConvertToJson {
    ConvertToJson::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_json() {
        let executor = ConvertToJson::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!({"a": 1}));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!("{\"a\":1}")));
    }

    #[test]
    fn test_to_json_pretty() {
        let executor = ConvertToJson::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!({"a": 1}));
        inputs.insert("pretty".to_string(), serde_json::json!(true));

        let result = executor.execute(inputs, None);
        let json_str = result.get("result").unwrap().as_str().unwrap();
        assert!(json_str.contains('\n'));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "convert.to_json");
        assert_eq!(executor.category, "convert");
    }
}
