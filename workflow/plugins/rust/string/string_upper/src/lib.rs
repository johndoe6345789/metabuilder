//! Workflow plugin: uppercase string.

use serde_json::Value;
use std::collections::HashMap;

/// Convert string to uppercase.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let string: String = inputs
        .get("string")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(string.to_uppercase()));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_upper() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("hello"));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!("HELLO")));
    }
}
