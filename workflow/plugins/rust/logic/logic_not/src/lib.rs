//! Workflow plugin: logical NOT.

use serde_json::Value;
use std::collections::HashMap;

/// Helper to convert Value to bool.
fn to_bool(v: &Value) -> bool {
    match v {
        Value::Bool(b) => *b,
        Value::Number(n) => n.as_f64().map(|f| f != 0.0).unwrap_or(false),
        Value::String(s) => !s.is_empty(),
        Value::Null => false,
        Value::Array(a) => !a.is_empty(),
        Value::Object(o) => !o.is_empty(),
    }
}

/// Logical NOT on a boolean value.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let value = inputs.get("value").unwrap_or(&Value::Null);

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(!to_bool(value)));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_not() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!(true));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(false)));
    }
}
