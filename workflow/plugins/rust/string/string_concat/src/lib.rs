//! Workflow plugin: concatenate strings.

use serde_json::Value;
use std::collections::HashMap;

/// Concatenate multiple strings with optional separator.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let strings: Vec<String> = inputs
        .get("strings")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();
    let separator: String = inputs
        .get("separator")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let result = strings.join(&separator);

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_concat() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("strings".to_string(), serde_json::json!(["hello", " ", "world"]));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!("hello world")));
    }
}
