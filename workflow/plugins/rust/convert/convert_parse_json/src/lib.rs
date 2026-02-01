//! Workflow plugin: parse JSON string.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ConvertParseJson implements the NodeExecutor trait for JSON parsing.
pub struct ConvertParseJson {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ConvertParseJson {
    /// Creates a new ConvertParseJson instance.
    pub fn new() -> Self {
        Self {
            node_type: "convert.parse_json",
            category: "convert",
            description: "Parse JSON string to value",
        }
    }
}

impl Default for ConvertParseJson {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ConvertParseJson {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let string: String = inputs
            .get("string")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut output = HashMap::new();

        match serde_json::from_str::<Value>(&string) {
            Ok(value) => {
                output.insert("result".to_string(), value);
            }
            Err(e) => {
                output.insert("result".to_string(), Value::Null);
                output.insert("error".to_string(), serde_json::json!(e.to_string()));
            }
        }

        output
    }
}

/// Creates a new ConvertParseJson instance.
pub fn create() -> ConvertParseJson {
    ConvertParseJson::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_json() {
        let executor = ConvertParseJson::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("{\"a\":1}"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!({"a": 1})));
    }

    #[test]
    fn test_parse_json_invalid() {
        let executor = ConvertParseJson::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("{invalid}"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&Value::Null));
        assert!(result.get("error").is_some());
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "convert.parse_json");
        assert_eq!(executor.category, "convert");
    }
}
