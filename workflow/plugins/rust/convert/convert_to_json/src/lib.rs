//! Workflow plugin: convert to JSON string.

use serde_json::Value;
use std::collections::HashMap;

/// Convert value to JSON string.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let value = inputs.get("value").unwrap_or(&Value::Null);
    let pretty: bool = inputs
        .get("pretty")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(false);

    let result = if pretty {
        serde_json::to_string_pretty(value).unwrap_or_default()
    } else {
        serde_json::to_string(value).unwrap_or_default()
    };

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_json() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("value".to_string(), serde_json::json!({"a": 1}));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!("{\"a\":1}")));
    }
}
