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
| [clang-format](https://clang.llvm.org/docs/ClangFormat.html) | any version (for live preview) |

> **Windows only**: Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** workload before installing Rust.

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/your-name/clang-format-editor.git
cd clang-format-editor

# 2. Install Node dependencies
npm install
```

## Running

```bash
# Development mode — hot-reload for both frontend and Rust backend
npm run tauri dev
```

Vite starts on `http://localhost:1420` and Tauri opens the desktop window automatically.  
The live preview requires `clang-format` to be available in your `PATH`.

## Building

```bash
# Build the production desktop installer
npm run tauri build
```

Output is placed in `src-tauri/target/release/bundle/`.

## Project Structure

```
clang-format-editor/
├── src/                         # Vue 3 frontend
│   ├── App.vue                  # Root component — three-panel layout
│   ├── main.ts                  # Entry point; router + Pinia setup
│   ├── assets/styles/           # SCSS variables (themes) + global styles
│   ├── components/
│   │   ├── CodePreview.vue      # Shiki-highlighted C++ / YAML preview
│   │   ├── OptionControl.vue    # Universal form control (toggle/select/number/text)
│   │   ├── OptionGroup.vue      # Collapsible option group container
│   │   ├── SideNav.vue          # Left navigation sidebar
│   │   └── Toolbar.vue          # Top toolbar (preset, import, export, theme)
│   ├── stores/formatStore.ts    # Pinia store — config state, YAML export/import
│   ├── types/clangFormat.ts     # TypeScript type definitions for all options
│   ├── data/
│   │   ├── presets.ts           # LLVM defaults + per-preset overrides
│   │   └── sampleCode.ts        # Sample C++ code for the preview panel
│   └── views/                   # One page per option category
│       ├── General.vue
│       ├── TabsAndIndents.vue
│       ├── Spaces.vue
│       ├── WrappingAndBraces.vue
│       ├── BlankLines.vue
│       └── Alignment.vue
├── src-tauri/                   # Tauri / Rust backend
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   ├── lib.rs               # Plugin registration
│   │   └── commands/mod.rs      # format_code, get_clang_format_version commands
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── index.html
```

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Tauri v2](https://v2.tauri.app/) (Rust) |
| Frontend | [Vue 3](https://vuejs.org/) + TypeScript |
| State | [Pinia](https://pinia.vuejs.org/) |
| Build | [Vite](https://vitejs.dev/) |
| Highlighting | [Shiki](https://shiki.style/) |
| YAML | [js-yaml](https://github.com/nodeca/js-yaml) |
| Styling | SCSS + CSS Custom Properties |

## References

- [clang-format Style Options](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)
- [Tauri v2 Documentation](https://v2.tauri.app/)
- [Vue 3 Documentation](https://vuejs.org/)

## License

MIT
