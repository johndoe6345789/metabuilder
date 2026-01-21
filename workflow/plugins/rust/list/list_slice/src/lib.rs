//! Workflow plugin: slice a list.

use serde_json::Value;
use std::collections::HashMap;

/// Slice a list.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let list: Vec<Value> = inputs
        .get("list")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();
    let start: i64 = inputs
        .get("start")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(0);
    let end: Option<i64> = inputs
        .get("end")
        .and_then(|v| serde_json::from_value(v.clone()).ok());

    let len = list.len() as i64;

    // Handle negative indices
    let start_idx = if start < 0 { (len + start).max(0) } else { start.min(len) } as usize;
    let end_idx = match end {
        Some(e) if e < 0 => (len + e).max(0) as usize,
        Some(e) => e.min(len) as usize,
        None => len as usize,
    };

    let result: Vec<Value> = if start_idx < end_idx {
        list[start_idx..end_idx].to_vec()
    } else {
        vec![]
    };

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_slice() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("list".to_string(), serde_json::json!([1, 2, 3, 4, 5]));
        inputs.insert("start".to_string(), serde_json::json!(1));
        inputs.insert("end".to_string(), serde_json::json!(4));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!([2, 3, 4])));
    }
}
