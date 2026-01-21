//! List manipulation workflow plugins

use crate::{get_input, output, PluginResult, Runtime};
use serde_json::Value;
use std::collections::HashMap;

/// Concatenate multiple lists.
pub fn concat(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let lists: Vec<Vec<Value>> = get_input(inputs, "lists").unwrap_or_default();

    let result: Vec<Value> = lists.into_iter().flatten().collect();
    Ok(output!("result" => result))
}

/// Get list length.
pub fn length(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();
    Ok(output!("result" => list.len()))
}

/// Slice a list.
pub fn slice(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();
    let start: i64 = get_input(inputs, "start").unwrap_or(0);
    let end: Option<i64> = get_input(inputs, "end");

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

    Ok(output!("result" => result))
}

/// Reverse a list.
pub fn reverse(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let mut list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();
    list.reverse();
    Ok(output!("result" => list))
}

/// Get first element of list.
pub fn first(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();
    let result = list.first().cloned().unwrap_or(Value::Null);
    Ok(output!("result" => result))
}

/// Get last element of list.
pub fn last(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();
    let result = list.last().cloned().unwrap_or(Value::Null);
    Ok(output!("result" => result))
}

/// Get element at index.
pub fn at(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();
    let index: i64 = get_input(inputs, "index").unwrap_or(0);

    let len = list.len() as i64;
    let idx = if index < 0 { len + index } else { index };

    let result = if idx >= 0 && (idx as usize) < list.len() {
        list[idx as usize].clone()
    } else {
        Value::Null
    };

    Ok(output!("result" => result))
}

/// Check if list contains value.
pub fn contains(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();
    let value = inputs.get("value").unwrap_or(&Value::Null);

    Ok(output!("result" => list.contains(value)))
}

/// Find index of value in list.
pub fn index_of(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();
    let value = inputs.get("value").unwrap_or(&Value::Null);

    let result = list.iter().position(|v| v == value).map(|i| i as i64).unwrap_or(-1);
    Ok(output!("result" => result))
}

/// Remove duplicates from list.
pub fn unique(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();

    let mut seen = Vec::new();
    for item in list {
        if !seen.contains(&item) {
            seen.push(item);
        }
    }

    Ok(output!("result" => seen))
}

/// Sort a list.
pub fn sort(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let mut list: Vec<Value> = get_input(inputs, "list").unwrap_or_default();

    list.sort_by(|a, b| {
        match (a, b) {
            // Numbers
            (Value::Number(n1), Value::Number(n2)) => {
                let f1 = n1.as_f64().unwrap_or(0.0);
                let f2 = n2.as_f64().unwrap_or(0.0);
                f1.partial_cmp(&f2).unwrap_or(std::cmp::Ordering::Equal)
            }
            // Strings
            (Value::String(s1), Value::String(s2)) => s1.cmp(s2),
            // Booleans (false < true)
            (Value::Bool(b1), Value::Bool(b2)) => b1.cmp(b2),
            // Null is smallest
            (Value::Null, Value::Null) => std::cmp::Ordering::Equal,
            (Value::Null, _) => std::cmp::Ordering::Less,
            (_, Value::Null) => std::cmp::Ordering::Greater,
            // Mixed types: compare by type name as fallback
            _ => std::cmp::Ordering::Equal,
        }
    });

    Ok(output!("result" => list))
}
