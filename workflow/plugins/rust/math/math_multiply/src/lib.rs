//! Workflow plugin: multiply numbers.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// MathMultiply implements the NodeExecutor trait for multiplying numbers.
pub struct MathMultiply {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl MathMultiply {
    /// Creates a new MathMultiply instance.
    pub fn new() -> Self {
        Self {
            node_type: "math.multiply",
            category: "math",
            description: "Multiply two or more numbers",
        }
    }
}

impl Default for MathMultiply {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for MathMultiply {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let numbers: Vec<f64> = inputs
            .get("numbers")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();

        if numbers.is_empty() {
            result.insert("result".to_string(), serde_json::json!(0));
            return result;
        }

        let product: f64 = numbers.iter().product();
        result.insert("result".to_string(), serde_json::json!(product));
        result
    }
}

/// Creates a new MathMultiply instance.
pub fn create() -> MathMultiply {
    MathMultiply::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multiply() {
        let executor = MathMultiply::new();
        let mut inputs = HashMap::new();
        inputs.insert("numbers".to_string(), serde_json::json!([2.0, 3.0, 4.0]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(24.0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "math.multiply");
        assert_eq!(executor.category, "math");
    }
}
