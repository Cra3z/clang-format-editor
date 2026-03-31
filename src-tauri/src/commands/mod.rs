use std::process::Command;

/// 调用系统 clang-format 格式化代码
#[tauri::command]
pub fn format_code(code: String, style: String, assume_filename: Option<String>) -> Result<String, String> {
    use std::io::Write;

    let assume_filename = assume_filename
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| "input.cpp".to_string());

    let mut child = Command::new("clang-format")
        .arg(format!("--style={}", style))
        .arg(format!("--assume-filename={}", assume_filename))
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start clang-format: {}", e))?;

    if let Some(ref mut stdin) = child.stdin {
        stdin
            .write_all(code.as_bytes())
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
    }
    // Close stdin by dropping it
    drop(child.stdin.take());

    let output = child
        .wait_with_output()
        .map_err(|e| format!("Failed to wait for clang-format: {}", e))?;

    if output.status.success() {
        String::from_utf8(output.stdout)
            .map_err(|e| format!("Invalid UTF-8 output: {}", e))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("clang-format error: {}", stderr))
    }
}

/// 获取系统 clang-format 版本
#[tauri::command]
pub fn get_clang_format_version() -> Result<String, String> {
    let output = Command::new("clang-format")
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to run clang-format: {}", e))?;

    if output.status.success() {
        String::from_utf8(output.stdout)
            .map(|s| s.trim().to_string())
            .map_err(|e| format!("Invalid UTF-8: {}", e))
    } else {
        Err("clang-format not found or failed".to_string())
    }
}
