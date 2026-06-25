//! Workflow plugin: ceil a number.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// MathCeil implements the NodeExecutor trait for ceiling operations.
pub struct MathCeil {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl MathCeil {
    /// Creates a new MathCeil instance.
    pub fn new() -> Self {
        Self {
            node_type: "math.ceil",
            category: "math",
            description: "Ceil a number (round up)",
        }
    }
}

impl Default for MathCeil {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for MathCeil {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let value: f64 = inputs
            .get("value")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(0.0);

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(value.ceil()));
        result
    }
}

/// Creates a new MathCeil instance.
pub fn create() -> MathCeil {
    MathCeil::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ceil() {
        let executor = MathCeil::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(3.2));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(4.0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "math.ceil");
        assert_eq!(executor.category, "math");
    }
}
