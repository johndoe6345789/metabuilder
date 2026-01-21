//! Workflow plugin: substring.

use serde_json::Value;
use std::collections::HashMap;

/// Extract a substring from a string.
pub fn run(_runtime: &mut HashMap<String, Value>, inputs: &HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let string: String = inputs
        .get("string")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();
    let start: i64 = inputs
        .get("start")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or(0);
    let end: Option<i64> = inputs
        .get("end")
        .and_then(|v| serde_json::from_value(v.clone()).ok());

    let chars: Vec<char> = string.chars().collect();
    let len = chars.len() as i64;

    // Handle negative indices
    let start_idx = if start < 0 { (len + start).max(0) } else { start.min(len) } as usize;
    let end_idx = match end {
        Some(e) if e < 0 => (len + e).max(0) as usize,
        Some(e) => e.min(len) as usize,
        None => len as usize,
    };

    let result: String = if start_idx < end_idx {
        chars[start_idx..end_idx].iter().collect()
    } else {
        String::new()
    };

    let mut output = HashMap::new();
    output.insert("result".to_string(), serde_json::json!(result));
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_substring() {
        let mut runtime = HashMap::new();
        let mut inputs = HashMap::new();
        inputs.insert("string".to_string(), serde_json::json!("hello world"));
        inputs.insert("start".to_string(), serde_json::json!(0));
        inputs.insert("end".to_string(), serde_json::json!(5));

        let result = run(&mut runtime, &inputs).unwrap();
        assert_eq!(result.get("result"), Some(&serde_json::json!("hello")));
    }
}
