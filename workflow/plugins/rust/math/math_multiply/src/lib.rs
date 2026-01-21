//! Workflow plugin: multiply numbers.

use serde_json::Value;
use std::collections::HashMap;

/// Multiply two or more numbers.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let numbers: Vec<f64> = inputs
        .get("numbers")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let mut output = HashMap::new();

    if numbers.is_empty() {
        output.insert("result".to_string(), serde_json::json!(0));
        return Ok(output);
    }

    let result: f64 = numbers.iter().product();
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multiply() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("numbers".to_string(), serde_json::json!([2.0, 3.0, 4.0]));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(24.0)));
    }
}
