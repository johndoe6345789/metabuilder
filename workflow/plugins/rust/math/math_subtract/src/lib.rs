//! Workflow plugin: subtract numbers.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// MathSubtract implements the NodeExecutor trait for subtracting numbers.
pub struct MathSubtract {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl MathSubtract {
    /// Creates a new MathSubtract instance.
    pub fn new() -> Self {
        Self {
            node_type: "math.subtract",
            category: "math",
            description: "Subtract numbers from the first number",
        }
    }
}

impl Default for MathSubtract {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for MathSubtract {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let numbers: Vec<f64> = inputs
            .get("numbers")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();

        if numbers.is_empty() {
            result.insert("result".to_string(), serde_json::json!(0));
            result.insert("error".to_string(), serde_json::json!("numbers must be non-empty"));
            return result;
        }

        let difference = numbers.iter().skip(1).fold(numbers[0], |acc, x| acc - x);
        result.insert("result".to_string(), serde_json::json!(difference));
        result
    }
}

/// Creates a new MathSubtract instance.
pub fn create() -> MathSubtract {
    MathSubtract::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_subtract() {
        let executor = MathSubtract::new();
        let mut inputs = HashMap::new();
        inputs.insert("numbers".to_string(), serde_json::json!([10.0, 3.0, 2.0]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(5.0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "math.subtract");
        assert_eq!(executor.category, "math");
    }
}
