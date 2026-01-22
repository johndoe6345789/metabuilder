//! Workflow plugin: power operation.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// MathPower implements the NodeExecutor trait for power operations.
pub struct MathPower {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl MathPower {
    /// Creates a new MathPower instance.
    pub fn new() -> Self {
        Self {
            node_type: "math.power",
            category: "math",
            description: "Calculate power of a number",
        }
    }
}

impl Default for MathPower {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for MathPower {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let base: f64 = inputs
            .get("base")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(0.0);
        let exp: f64 = inputs
            .get("exponent")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(1.0);

        let mut result = HashMap::new();
        result.insert("result".to_string(), serde_json::json!(base.powf(exp)));
        result
    }
}

/// Creates a new MathPower instance.
pub fn create() -> MathPower {
    MathPower::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_power() {
        let executor = MathPower::new();
        let mut inputs = HashMap::new();
        inputs.insert("base".to_string(), serde_json::json!(2.0));
        inputs.insert("exponent".to_string(), serde_json::json!(3.0));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(8.0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "math.power");
        assert_eq!(executor.category, "math");
    }
}
