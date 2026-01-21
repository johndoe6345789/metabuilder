//! String manipulation workflow plugins

use crate::{get_input, output, PluginResult, Runtime};
use serde_json::Value;
use std::collections::HashMap;

/// Concatenate multiple strings.
pub fn concat(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let strings: Vec<String> = get_input(inputs, "strings").unwrap_or_default();
    let separator: String = get_input(inputs, "separator").unwrap_or_default();

    let result = strings.join(&separator);
    Ok(output!("result" => result))
}

/// Split a string by separator.
pub fn split(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();
    let separator: String = get_input(inputs, "separator").unwrap_or_default();

    let result: Vec<&str> = if separator.is_empty() {
        string.chars().map(|c| {
            // Return character as string slice - need to collect differently
            Box::leak(c.to_string().into_boxed_str()) as &str
        }).collect()
    } else {
        string.split(&separator).collect()
    };

    Ok(output!("result" => result))
}

/// Replace occurrences in a string.
pub fn replace(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();
    let old: String = get_input(inputs, "old").unwrap_or_default();
    let new: String = get_input(inputs, "new").unwrap_or_default();

    let result = string.replace(&old, &new);
    Ok(output!("result" => result))
}

/// Convert string to uppercase.
pub fn upper(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();
    Ok(output!("result" => string.to_uppercase()))
}

/// Convert string to lowercase.
pub fn lower(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();
    Ok(output!("result" => string.to_lowercase()))
}

/// Trim whitespace from string.
pub fn trim(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();
    Ok(output!("result" => string.trim()))
}

/// Get string length.
pub fn length(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();
    Ok(output!("result" => string.len()))
}

/// Check if string contains substring.
pub fn contains(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();
    let substring: String = get_input(inputs, "substring").unwrap_or_default();

    Ok(output!("result" => string.contains(&substring)))
}

/// Check if string starts with prefix.
pub fn starts_with(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();
    let prefix: String = get_input(inputs, "prefix").unwrap_or_default();

    Ok(output!("result" => string.starts_with(&prefix)))
}

/// Check if string ends with suffix.
pub fn ends_with(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();
    let suffix: String = get_input(inputs, "suffix").unwrap_or_default();

    Ok(output!("result" => string.ends_with(&suffix)))
}

/// Extract a substring from a string.
pub fn substring(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let string: String = get_input(inputs, "string").unwrap_or_default();
    let start: i64 = get_input(inputs, "start").unwrap_or(0);
    let end: Option<i64> = get_input(inputs, "end");

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

    Ok(output!("result" => result))
}
