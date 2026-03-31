use serde::Serialize;
use std::path::Path;
use std::process::Command;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClangFormatInspection {
    version: String,
    resolved_path: String,
}

fn resolve_clang_format_executable(executable_path: Option<String>) -> String {
    executable_path
        .filter(|value| !value.trim().is_empty())
        .map(|value| value.trim().to_string())
        .unwrap_or_else(|| "clang-format".to_string())
}

fn path_to_display_string(path: &Path) -> String {
    dunce::simplified(path).to_string_lossy().to_string()
}

fn canonicalize_display_path(path: &Path) -> Option<String> {
    dunce::canonicalize(path)
        .ok()
        .map(|value| path_to_display_string(&value))
}

fn resolve_executable_path(executable: &str) -> Option<String> {
    let path = Path::new(executable);

    if path.is_absolute() || executable.contains('/') || executable.contains('\\') {
        return canonicalize_display_path(path)
            .or_else(|| path.exists().then(|| path_to_display_string(path)));
    }

    let resolver = if cfg!(windows) { "where" } else { "which" };
    let output = Command::new(resolver).arg(executable).output().ok()?;

    if !output.status.success() {
        return None;
    }

    let first_line = String::from_utf8_lossy(&output.stdout)
        .lines()
        .find(|line| !line.trim().is_empty())?
        .trim()
        .to_string();

    canonicalize_display_path(Path::new(&first_line))
        .or_else(|| Some(path_to_display_string(Path::new(&first_line))))
}

fn inspect_clang_format_impl(executable_path: Option<String>) -> Result<ClangFormatInspection, String> {
    let executable = resolve_clang_format_executable(executable_path);

    let output = Command::new(&executable)
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to run {}: {}", executable, e))?;

    if !output.status.success() {
        return Err(format!("{} not found or failed", executable));
    }

    let version = String::from_utf8(output.stdout)
        .map(|value| value.trim().to_string())
        .map_err(|e| format!("Invalid UTF-8: {}", e))?;

    Ok(ClangFormatInspection {
        version,
        resolved_path: resolve_executable_path(&executable).unwrap_or(executable),
    })
}

/// 调用系统 clang-format 格式化代码
#[tauri::command]
pub fn format_code(
    code: String,
    style: String,
    assume_filename: Option<String>,
    executable_path: Option<String>,
) -> Result<String, String> {
    use std::io::Write;

    let assume_filename = assume_filename
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| "input.cpp".to_string());
    let executable = resolve_clang_format_executable(executable_path);

    let mut child = Command::new(&executable)
        .arg(format!("--style={}", style))
        .arg(format!("--assume-filename={}", assume_filename))
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start {}: {}", executable, e))?;

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
        Err(format!("{} error: {}", executable, stderr))
    }
}

/// 获取系统 clang-format 版本
#[tauri::command]
pub fn get_clang_format_version(executable_path: Option<String>) -> Result<String, String> {
    inspect_clang_format_impl(executable_path).map(|info| info.version)
}

#[tauri::command]
pub fn inspect_clang_format(executable_path: Option<String>) -> Result<ClangFormatInspection, String> {
    inspect_clang_format_impl(executable_path)
}
