//! Workflow plugin: convert to boolean.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ConvertToBoolean implements the NodeExecutor trait for boolean conversion.
pub struct ConvertToBoolean {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ConvertToBoolean {
    /// Creates a new ConvertToBoolean instance.
    pub fn new() -> Self {
        Self {
            node_type: "convert.to_boolean",
            category: "convert",
            description: "Convert value to boolean",
        }
    }
}

impl Default for ConvertToBoolean {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ConvertToBoolean {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let value = inputs.get("value").unwrap_or(&Value::Null);

        let result = match value {
            Value::Bool(b) => *b,
            Value::Number(n) => n.as_f64().map(|f| f != 0.0).unwrap_or(false),
            Value::String(s) => {
                let lower = s.to_lowercase();
                lower == "true" || lower == "1" || lower == "yes"
            }
            Value::Null => false,
            Value::Array(a) => !a.is_empty(),
            Value::Object(o) => !o.is_empty(),
        };

        let mut output = HashMap::new();
        output.insert("result".to_string(), serde_json::json!(result));
        output
    }
}

/// Creates a new ConvertToBoolean instance.
pub fn create() -> ConvertToBoolean {
    ConvertToBoolean::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_boolean_string() {
        let executor = ConvertToBoolean::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!("true"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }

    #[test]
    fn test_to_boolean_number() {
        let executor = ConvertToBoolean::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(0));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(false)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "convert.to_boolean");
        assert_eq!(executor.category, "convert");
    }
}
