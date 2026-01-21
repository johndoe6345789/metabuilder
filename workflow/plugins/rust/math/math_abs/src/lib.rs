//! Workflow plugin: absolute value.

use serde_json::Value;
use std::collections::HashMap;

/// Calculate absolute value of a number.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let value: f64 = inputs
        .get("value")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(0.0);

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(value.abs()));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_abs() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(-5.0));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(5.0)));
    }
}
