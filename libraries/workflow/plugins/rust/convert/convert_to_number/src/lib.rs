//! Workflow plugin: convert to number.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// ConvertToNumber implements the NodeExecutor trait for number conversion.
pub struct ConvertToNumber {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl ConvertToNumber {
    /// Creates a new ConvertToNumber instance.
    pub fn new() -> Self {
        Self {
            node_type: "convert.to_number",
            category: "convert",
            description: "Convert value to number",
        }
    }
}

impl Default for ConvertToNumber {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for ConvertToNumber {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let value = inputs.get("value").unwrap_or(&Value::Null);

        let result = match value {
            Value::Number(n) => n.as_f64().unwrap_or(0.0),
            Value::String(s) => s.parse::<f64>().unwrap_or(0.0),
            Value::Bool(b) => if *b { 1.0 } else { 0.0 },
            _ => 0.0,
        };

        let mut output = HashMap::new();
        output.insert("result".to_string(), serde_json::json!(result));
        output
    }
}

/// Creates a new ConvertToNumber instance.
pub fn create() -> ConvertToNumber {
    ConvertToNumber::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_number_string() {
        let executor = ConvertToNumber::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!("42.5"));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(42.5)));
    }

    #[test]
    fn test_to_number_bool() {
        let executor = ConvertToNumber::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(true));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(1.0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "convert.to_number");
        assert_eq!(executor.category, "convert");
    }
}
