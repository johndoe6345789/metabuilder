//! Workflow plugin: floor a number.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// MathFloor implements the NodeExecutor trait for floor operations.
pub struct MathFloor {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl MathFloor {
    /// Creates a new MathFloor instance.
    pub fn new() -> Self {
        Self {
            node_type: "math.floor",
            category: "math",
            description: "Floor a number (round down)",
        }
    }
}

impl Default for MathFloor {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for MathFloor {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let value: f64 = inputs
            .get("value")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(0.0);

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(value.floor()));
        result
    }
}

/// Creates a new MathFloor instance.
pub fn create() -> MathFloor {
    MathFloor::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_floor() {
        let executor = MathFloor::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(3.7));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(3.0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "math.floor");
        assert_eq!(executor.category, "math");
    }
}
