//! Workflow plugin: replace in string.

use serde_json::Value;
use std::collections::HashMap;

/// Replace occurrences in a string.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let string: String = inputs
        .get("string")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();
    let old: String = inputs
        .get("old")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();
    let new: String = inputs
        .get("new")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let result = string.replace(&old, &new);

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_replace() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("hello world"));
        inputs.insert("old".to_string(), serde_json::json!("world"));
        inputs.insert("new".to_string(), serde_json::json!("rust"));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!("hello rust")));
    }
}
