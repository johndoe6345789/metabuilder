//! Workflow plugin: divide numbers.

use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;

/// Trait for workflow node executors.
pub trait NodeExecutor {
    /// Execute the node with given inputs and optional runtime context.
    fn execute(&self, inputs: HashMap<String, Value>, runtime: Option<&dyn Any>) -> HashMap<String, Value>;
}

/// MathDivide implements the NodeExecutor trait for dividing numbers.
pub struct MathDivide {
    pub node_type: &'static str,
    pub category: &'static str,
    pub description: &'static str,
}

impl MathDivide {
    /// Creates a new MathDivide instance.
    pub fn new() -> Self {
        Self {
            node_type: "math.divide",
            category: "math",
            description: "Divide the first number by subsequent numbers",
        }
    }
}

impl Default for MathDivide {
    fn default() -> Self {
        Self::new()
    }
}

impl NodeExecutor for MathDivide {
    fn execute(&self, inputs: HashMap<String, Value>, _runtime: Option<&dyn Any>) -> HashMap<String, Value> {
        let numbers: Vec<f64> = inputs
            .get("numbers")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let mut result = HashMap::new();

        if numbers.len() < 2 {
            result.insert("result".to_string(), serde_json::json!(0));
            result.insert("error".to_string(), serde_json::json!("need at least 2 numbers"));
            return result;
        }

        for &n in &numbers[1..] {
            if n == 0.0 {
                result.insert("result".to_string(), serde_json::json!(0));
                result.insert("error".to_string(), serde_json::json!("division by zero"));
                return result;
            }
        }

        let quotient = numbers.iter().skip(1).fold(numbers[0], |acc, x| acc / x);
        result.insert("result".to_string(), serde_json::json!(quotient));
        result
    }
}

/// Creates a new MathDivide instance.
pub fn create() -> MathDivide {
    MathDivide::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_divide() {
        let executor = MathDivide::new();
        let mut inputs = HashMap::new();
        inputs.insert("numbers".to_string(), serde_json::json!([24.0, 3.0, 2.0]));

        let result = executor.execute(inputs, None);
        assert_eq!(result.get("result"), Some(&serde_json::json!(4.0)));
    }

    #[test]
    fn test_factory() {
        let executor = create();
        assert_eq!(executor.node_type, "math.divide");
        assert_eq!(executor.category, "math");
    }
}
