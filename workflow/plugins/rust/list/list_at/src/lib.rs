//! Workflow plugin: get element at index.

use serde_json::Value;
use std::collections::HashMap;

/// Get element at index.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let list: Vec<Value> = inputs
        .get("list")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();
    let index: i64 = inputs
        .get("index")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(0);

    let len = list.len() as i64;
    let idx = if index < 0 { len + index } else { index };

    let result = if idx >= 0 && (idx as usize) < list.len() {
        list[idx as usize].clone()
    } else {
        Value::Null
    };

    let mut output = HashMap::new();
    output.insert("result".to_string(), result);
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_at() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([1, 2, 3]));
        inputs.insert("index".to_string(), serde_json::json!(1));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!(2)));
    }
}
