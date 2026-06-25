//! Workflow plugin: modulo operation.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// MathModulo implements the NodeExecutor trait for modulo operations.
pub struct MathModulo {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl MathModulo {
    /// Creates a new MathModulo instance.
    pub fn new() -> Self {
        Self {
            node_type: "math.modulo",
            category: "math",
            description: "Calculate modulo of two numbers",
        }
    }
}

impl Default for MathModulo {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for MathModulo {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let a: f64 = inputs
            .get("a")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(0.0);
        let b: f64 = inputs
            .get("b")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or(1.0);

        let mut result = HashMap::new();

        if b == 0.0 {
            result.insert("result".to_string(), serde_json::json!(0));
            result.insert("error".to_string(), serde_json::json!("division by zero"));
            return result;
        }

        result.insert("result".to_string(), serde_json::json!(a % b));
        result
    }
}

/// Creates a new MathModulo instance.
pub fn create() -> MathModulo {
    MathModulo::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_modulo() {
        let executor = MathModulo::new();
        let mut inputs = HashMap::new();
        inputs.insert("a".to_string(), serde_json::json!(10.0));
        inputs.insert("b".to_string(), serde_json::json!(3.0));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(1.0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "math.modulo");
        assert_eq!(executor.category, "math");
    }
}
