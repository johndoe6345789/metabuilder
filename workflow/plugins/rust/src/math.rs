//! Mathematical workflow plugins

use crate::{get_input, output, PluginResult, Runtime};
use serde_json::Value;
use std::collections::HashMap;

/// Add two or more numbers.
pub fn add(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let numbers: Vec<f64> = get_input(inputs, "numbers").unwrap_or_default();
    let sum: f64 = numbers.iter().sum();
    Ok(output!("result" => sum))
}

/// Subtract numbers from the first number.
pub fn subtract(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let numbers: Vec<f64> = get_input(inputs, "numbers").unwrap_or_default();
    if numbers.is_empty() {
        return Ok(output!("result" => 0, "error" => "numbers must be non-empty"));
    }

    let result = numbers.iter().skip(1).fold(numbers[0], |acc, x| acc - x);
    Ok(output!("result" => result))
}

/// Multiply two or more numbers.
pub fn multiply(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let numbers: Vec<f64> = get_input(inputs, "numbers").unwrap_or_default();
    if numbers.is_empty() {
        return Ok(output!("result" => 0));
    }

    let result: f64 = numbers.iter().product();
    Ok(output!("result" => result))
}

/// Divide the first number by subsequent numbers.
pub fn divide(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let numbers: Vec<f64> = get_input(inputs, "numbers").unwrap_or_default();
    if numbers.len() < 2 {
        return Ok(output!("result" => 0, "error" => "need at least 2 numbers"));
    }

    for &n in &numbers[1..] {
        if n == 0.0 {
            return Ok(output!("result" => 0, "error" => "division by zero"));
        }
    }

    let result = numbers.iter().skip(1).fold(numbers[0], |acc, x| acc / x);
    Ok(output!("result" => result))
}

/// Calculate modulo.
pub fn modulo(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let a: f64 = get_input(inputs, "a").unwrap_or(0.0);
    let b: f64 = get_input(inputs, "b").unwrap_or(1.0);

    if b == 0.0 {
        return Ok(output!("result" => 0, "error" => "division by zero"));
    }

    Ok(output!("result" => a % b))
}

/// Calculate power.
pub fn power(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let base: f64 = get_input(inputs, "base").unwrap_or(0.0);
    let exp: f64 = get_input(inputs, "exponent").unwrap_or(1.0);

    Ok(output!("result" => base.powf(exp)))
}

/// Calculate absolute value.
pub fn abs(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value: f64 = get_input(inputs, "value").unwrap_or(0.0);
    Ok(output!("result" => value.abs()))
}

/// Round a number.
pub fn round(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value: f64 = get_input(inputs, "value").unwrap_or(0.0);
    let decimals: i32 = get_input(inputs, "decimals").unwrap_or(0);

    let factor = 10_f64.powi(decimals);
    let result = (value * factor).round() / factor;

    Ok(output!("result" => result))
}

/// Floor a number (round down).
pub fn floor(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value: f64 = get_input(inputs, "value").unwrap_or(0.0);
    Ok(output!("result" => value.floor()))
}

/// Ceil a number (round up).
pub fn ceil(_runtime: &mut Runtime, inputs: &HashMap<String, Value>) -> PluginResult {
    let value: f64 = get_input(inputs, "value").unwrap_or(0.0);
    Ok(output!("result" => value.ceil()))
}
