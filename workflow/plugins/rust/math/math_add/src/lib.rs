//! Workflow plugin: add numbers.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// MathAdd implements the NodeExecutor trait for adding numbers.
pub struct MathAdd {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl MathAdd {
    /// Creates a new MathAdd instance.
    pub fn new() -> Self {
        Self {
            node_type: "math.add",
            category: "math",
            description: "Add two or more numbers",
        }
    }
}

impl Default for MathAdd {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for MathAdd {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let numbers: Vec<f64> = inputs
            .get("numbers")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let sum: f64 = numbers.iter().sum();

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(sum));
        result
    }
}

/// Creates a new MathAdd instance.
pub fn create() -> MathAdd {
    MathAdd::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        let executor = MathAdd::new();
        let mut inputs = HashMap::new();
        inputs.insert("numbers".to_string(), serde_json::json!([1.0, 2.0, 3.0]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(6.0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "math.add");
        assert_eq!(executor.category, "math");
    }
}
