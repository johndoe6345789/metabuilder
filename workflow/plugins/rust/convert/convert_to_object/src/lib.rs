//! Workflow plugin: convert to object.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ConvertToObject implements the NodeExecutor trait for object conversion.
pub struct ConvertToObject {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ConvertToObject {
    /// Creates a new ConvertToObject instance.
    pub fn new() -> Self {
        Self {
            node_type: "convert.to_object",
            category: "convert",
            description: "Convert value to object/dict",
        }
    }
}

impl Default for ConvertToObject {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ConvertToObject {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let value = inputs.get("value").unwrap_or(&Value::Null);

        let result = match value {
            Value::Object(o) => Value::Object(o.clone()),
            Value::Array(a) => {
                // Convert array of [key, value] pairs to object
                let mut obj = serde_json::Map::new();
                for item in a {
                    if let Value::Array(pair) = item {
                        if pair.len() >= 2 {
                            if let Value::String(key) = &pair[0] {
                                obj.insert(key.clone(), pair[1].clone());
                            }
                        }
                    }
                }
                Value::Object(obj)
            }
            _ => Value::Object(serde_json::Map::new()),
        };

        let mut output = HashMap::new();
        output.insert("result".to_string(), result);
        output
    }
}

/// Creates a new ConvertToObject instance.
pub fn create() -> ConvertToObject {
    ConvertToObject::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_object_array() {
        let executor = ConvertToObject::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!([["a", 1], ["b", 2]]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!({"a": 1, "b": 2})));
    }

    #[test]
    fn test_to_object_already_object() {
        let executor = ConvertToObject::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!({"x": 10}));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!({"x": 10})));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "convert.to_object");
        assert_eq!(executor.category, "convert");
    }
}
