//! Workflow plugin: modulo operation.

use serde_json::Value;
use std::collections::HashMap;

/// Calculate modulo of two numbers.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let a: f64 = inputs
        .get("a")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(0.0);
    let b: f64 = inputs
        .get("b")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(1.0);

    let mut output = HashMap::new();

    if b == 0.0 {
        output.insert("result".to_string(), serde_json::json!(0));
        output.insert("error".to_string(), serde_json::json!("division by zero"));
        return Ok(output);
    }

    output.insert("result".to_string(), serde_json::json!(a % b));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_modulo() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("a".to_string(), serde_json::json!(10.0));
        inputs.insert("b".to_string(), serde_json::json!(3.0));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(1.0)));
    }
}
