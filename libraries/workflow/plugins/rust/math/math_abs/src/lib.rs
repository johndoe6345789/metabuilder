//! Workflow plugin: absolute value.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// MathAbs implements the NodeExecutor trait for absolute value operations.
pub struct MathAbs {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl MathAbs {
    /// Creates a new MathAbs instance.
    pub fn new() -> Self {
        Self {
            node_type: "math.abs",
            category: "math",
            description: "Calculate absolute value",
        }
    }
}

impl Default for MathAbs {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for MathAbs {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let value: f64 = inputs
            .get("value")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(0.0);

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(value.abs()));
        result
    }
}

/// Creates a new MathAbs instance.
pub fn create() -> MathAbs {
    MathAbs::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_abs() {
        let executor = MathAbs::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(-5.0));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(5.0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "math.abs");
        assert_eq!(executor.category, "math");
    }
}
