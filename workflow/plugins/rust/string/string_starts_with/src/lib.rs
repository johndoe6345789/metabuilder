//! Workflow plugin: string starts with.

use serde_json::Value;
use std::collections::HashMap;

/// Check if string starts with prefix.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let string: String = inputs
        .get("string")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();
    let prefix: String = inputs
        .get("prefix")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(string.starts_with(&prefix)));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_starts_with() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("hello world"));
        inputs.insert("prefix".to_string(), serde_json::json!("hello"));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(true)));
    }
}
