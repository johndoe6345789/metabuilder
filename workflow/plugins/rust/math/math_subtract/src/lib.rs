//! Workflow plugin: subtract numbers.

use serde_json::Value;
use std::collections::HashMap;

/// Subtract numbers from the first number.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let numbers: Vec<f64> = inputs
        .get("numbers")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let mut output = HashMap::new();

    if numbers.is_empty() {
        output.insert("result".to_string(), serde_json::json!(0));
        output.insert("error".to_string(), serde_json::json!("numbers must be non-empty"));
        return Ok(output);
    }

    let result = numbers.iter().skip(1).fold(numbers[0], |acc, x| acc - x);
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_subtract() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("numbers".to_string(), serde_json::json!([10.0, 3.0, 2.0]));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(5.0)));
    }
}
