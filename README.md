# Clang-Format Editor

> A desktop GUI for visually editing clang-format code style configurations — similar to JetBrains CLion's **Settings | Editor | Code Style | C/C++** panel.

Built with **Tauri v2** + **Vue 3** + **TypeScript**.

English | [中文](README.zh-CN.md)

---

## Features

- **Visual editor** for all major clang-format options across 6 categories
- **Live preview** — formats sample C++ code in real time using the installed `clang-format` binary
- **7 preset styles** — LLVM, Google, Chromium, Mozilla, WebKit, Microsoft, GNU
- **Smart export** — only outputs options that differ from the selected base style, keeping files minimal
- **Import** — load an existing `.clang-format` file directly
- **Syntax-highlighted** code and YAML preview powered by [Shiki](https://shiki.style/)
- **Light / Dark theme** toggle (persisted across sessions)

## Option Categories

| Category | Key Options |
|---|---|
| **General** | `BasedOnStyle`, `Language`, `Standard`, `ColumnLimit`, `LineEnding` |
| **Tabs & Indents** | `IndentWidth`, `UseTab`, `TabWidth`, `ContinuationIndentWidth`, `AccessModifierOffset` |
| **Spaces** | `PointerAlignment`, `SpaceBeforeParens`, `SpacesInAngles`, `SpacesInParens` |
| **Wrapping & Braces** | `BreakBeforeBraces`, `BraceWrapping`, `AllowShort*`, `Break*`, `BinPack*` |
| **Blank Lines** | `MaxEmptyLinesToKeep`, `EmptyLineBeforeAccessModifier`, `SeparateDefinitionBlocks` |
| **Alignment** | `AlignConsecutive*`, `AlignTrailingComments`, `AlignOperands` |

## Prerequisites

| Tool | Requirement |
|---|---|
| [Node.js](https://nodejs.org/) | ≥ 18 |
| [Rust](https://rustup.rs/) | stable (install via `rustup`) |
| [clang-format](https://clang.llvm.org/docs/ClangFormat.html) | any version |

> **Windows only**: Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** workload before installing Rust.

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/your-name/clang-format-editor.git
cd clang-format-editor

# 2. Install Node dependencies
pnpm install
```

## Running

```bash
# Development mode — hot-reload for both frontend and Rust backend
pnpm run tauri dev
```

Vite starts on `http://localhost:1420` and Tauri opens the desktop window automatically.  
The live preview requires `clang-format` to be available in your `PATH`.

## Building

```bash
# Build the production desktop installer
pnpm run tauri build
```

Output is placed in `src-tauri/target/release/bundle/`.