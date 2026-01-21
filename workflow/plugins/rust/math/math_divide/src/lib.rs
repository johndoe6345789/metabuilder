//! Workflow plugin: divide numbers.

use serde_json::Value;
use std::collections::HashMap;

/// Divide the first number by subsequent numbers.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let numbers: Vec<f64> = inputs
        .get("numbers")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let mut output = HashMap::new();

    if numbers.len() < 2 {
        output.insert("result".to_string(), serde_json::json!(0));
        output.insert("error".to_string(), serde_json::json!("need at least 2 numbers"));
        return Ok(output);
    }

    for &n in &numbers[1..] {
        if n == 0.0 {
            output.insert("result".to_string(), serde_json::json!(0));
            output.insert("error".to_string(), serde_json::json!("division by zero"));
            return Ok(output);
        }
    }

    let result = numbers.iter().skip(1).fold(numbers[0], |acc, x| acc / x);
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_divide() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("numbers".to_string(), serde_json::json!([24.0, 3.0, 2.0]));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(4.0)));
    }
}
