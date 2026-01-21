//! Workflow plugin: convert to number.

use serde_json::Value;
use std::collections::HashMap;

/// Convert value to number.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let value = inputs.get("value").unwrap_or(&Value::Null);

    let result = match value {
        Value::Number(n) => n.as_f64().unwrap_or(0.0),
        Value::String(s) => s.parse::<f64>().unwrap_or(0.0),
        Value::Bool(b) => if *b { 1.0 } else { 0.0 },
        _ => 0.0,
    };

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_number() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!("42.5"));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(42.5)));
    }
}
