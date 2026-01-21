//! Workflow plugin: round a number.

use serde_json::Value;
use std::collections::HashMap;

/// Round a number to specified decimal places.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let value: f64 = inputs
        .get("value")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(0.0);
    let decimals: i32 = inputs
        .get("decimals")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(0);

    let factor = 10_f64.powi(decimals);
    let result = (value * factor).round() / factor;

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_round() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(3.14159));
        inputs.insert("decimals".to_string(), serde_json::json!(2));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(3.14)));
    }
}
