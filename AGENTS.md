# Clang-Format Editor — Agent Guide

## Project Overview

A Tauri + Vue 3 desktop application for visually editing clang-format code style configurations.
Similar to JetBrains CLion's "Settings | Editor | Code Style | C/C++" functionality,
it provides an intuitive UI for adjusting indentation, line wrapping, spacing, alignment, and more,
and exports a `.clang-format` file.

## Tech Stack

- **Desktop framework**: Tauri v2 (Rust backend)
- **Frontend framework**: Vue 3 + TypeScript
- **Build tool**: Vite
- **UI components**: Custom components (CLion-style settings panel)
- **State management**: Pinia
- **Styling**: SCSS / CSS Variables (dark / light themes)
- **Code highlighting**: Shiki (live code preview panel)
- **YAML handling**: js-yaml (read/write `.clang-format` files)

## Project Structure

```
clang-format-editor/
├── AGENTS.md                    # This file — project spec for agents
├── src-tauri/                   # Tauri Rust backend
│   ├── src/
│   │   ├── main.rs              # Tauri entry point
│   │   ├── lib.rs               # Library entry / plugin registration
│   │   └── commands/
│   │       └── mod.rs           # format_code, get_clang_format_version commands
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                         # Vue 3 frontend
│   ├── App.vue                  # Root component — three-panel layout
│   ├── main.ts                  # Entry point; router + Pinia setup
│   ├── assets/
│   │   └── styles/
│   │       ├── variables.scss   # CSS custom properties (dark & light themes)
│   │       └── global.scss      # Global reset and base styles
│   ├── components/
│   │   ├── CodePreview.vue      # Shiki-highlighted C++ / YAML preview panel
│   │   ├── OptionControl.vue    # Universal form control (toggle/select/number/text)
│   │   ├── OptionGroup.vue      # Collapsible option group container
│   │   ├── SideNav.vue          # Left navigation sidebar
│   │   └── Toolbar.vue          # Top toolbar (preset selector, import/export/theme)
│   ├── stores/
│   │   └── formatStore.ts       # Pinia store — config state, YAML export/import
│   ├── types/
│   │   └── clangFormat.ts       # TypeScript type definitions for all clang-format options
│   ├── data/
│   │   ├── presets.ts           # LLVM defaults + per-preset override objects
│   │   └── sampleCode.ts        # Sample C++ code used in the preview panel
│   └── views/                   # One page per option category
│       ├── General.vue
│       ├── TabsAndIndents.vue
│       ├── Spaces.vue
│       ├── WrappingAndBraces.vue
│       ├── BlankLines.vue
│       └── Alignment.vue
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## Core Feature Modules

### 1. Preset Style Selection (BasedOnStyle)
- Supported presets: LLVM, Google, Chromium, Mozilla, WebKit, Microsoft, GNU
- Selecting a preset auto-fills all option defaults
- Export only outputs options that differ from the preset (keeps files minimal)

### 2. Tabs and Indents
Corresponding clang-format options:
- `UseTab` — tab usage mode
- `IndentWidth` — indentation width
- `TabWidth` — tab character width
- `ContinuationIndentWidth` — continuation line indent
- `ConstructorInitializerIndentWidth` — constructor initializer list indent
- `IndentCaseLabels` — indent case labels
- `IndentCaseBlocks` — indent case blocks
- `IndentAccessModifiers` — indent access modifiers
- `AccessModifierOffset` — access modifier offset
- `IndentPPDirectives` — preprocessor directive indentation
- `IndentWrappedFunctionNames` — indent wrapped function names
- `IndentExternBlock` — extern block indentation
- `IndentGotoLabels` — goto label indentation
- `IndentRequiresClause` — requires clause indentation
- `NamespaceIndentation` — namespace indentation
- `LambdaBodyIndentation` — lambda body indentation
- `PPIndentWidth` — preprocessor indent width

### 3. Spaces
Corresponding clang-format options:
- `SpaceAfterCStyleCast` — space after C-style cast
- `SpaceAfterLogicalNot` — space after logical not
- `SpaceAfterTemplateKeyword` — space after template keyword
- `SpaceBeforeAssignmentOperators` — space before assignment operators
- `SpaceBeforeCaseColon` — space before case colon
- `SpaceBeforeCpp11BracedList` — space before C++11 braced list
- `SpaceBeforeCtorInitializerColon` — space before constructor initializer colon
- `SpaceBeforeInheritanceColon` — space before inheritance colon
- `SpaceBeforeParens` — space before parentheses
- `SpaceBeforeRangeBasedForLoopColon` — space before range-based for colon
- `SpaceBeforeSquareBrackets` — space before square brackets
- `SpacesInAngles` — spaces inside angle brackets
- `SpacesInParens` — spaces inside parentheses
- `SpacesInSquareBrackets` — spaces inside square brackets
- `SpacesBeforeTrailingComments` — spaces before trailing comments
- `BitFieldColonSpacing` — bit-field colon spacing
- `PointerAlignment` — pointer alignment
- `ReferenceAlignment` — reference alignment
- `SpaceAroundPointerQualifiers` — space around pointer qualifiers
- `SpaceAfterOperatorKeyword` — space after operator keyword

### 4. Wrapping and Braces
Corresponding clang-format options:
- `ColumnLimit` — column limit
- `BreakBeforeBraces` — brace wrapping style
- `BraceWrapping` — fine-grained brace wrapping control (when `Custom`)
- `AllowShortFunctionsOnASingleLine` — short functions on a single line
- `AllowShortIfStatementsOnASingleLine` — short if statements on a single line
- `AllowShortLoopsOnASingleLine` — short loops on a single line
- `AllowShortBlocksOnASingleLine` — short blocks on a single line
- `AllowShortCaseLabelsOnASingleLine` — short case labels on a single line
- `AllowShortLambdasOnASingleLine` — short lambdas on a single line
- `AllowShortEnumsOnASingleLine` — short enums on a single line
- `BreakBeforeBinaryOperators` — break before binary operators
- `BreakBeforeTernaryOperators` — break before ternary operators
- `BreakConstructorInitializers` — break constructor initializer lists
- `BreakInheritanceList` — break inheritance lists
- `BreakTemplateDeclarations` — break template declarations
- `BreakStringLiterals` — break string literals
- `BreakAfterReturnType` — break after return type
- `BinPackArguments` — bin-pack function call arguments
- `BinPackParameters` — bin-pack function declaration parameters
- `PackConstructorInitializers` — pack constructor initializer lists
- `AlwaysBreakBeforeMultilineStrings` — always break before multiline strings
- `Cpp11BracedListStyle` — C++11 braced list style

### 5. Blank Lines
Corresponding clang-format options:
- `MaxEmptyLinesToKeep` — maximum consecutive empty lines to keep
- `KeepEmptyLines` — empty line retention control
- `EmptyLineAfterAccessModifier` — empty line after access modifier
- `EmptyLineBeforeAccessModifier` — empty line before access modifier
- `SeparateDefinitionBlocks` — separate definition blocks with blank lines

### 6. Alignment
Corresponding clang-format options:
- `AlignAfterOpenBracket` — alignment after open bracket
- `AlignArrayOfStructures` — align struct array columns
- `AlignConsecutiveAssignments` — align consecutive assignments
- `AlignConsecutiveBitFields` — align consecutive bit fields
- `AlignConsecutiveDeclarations` — align consecutive declarations
- `AlignConsecutiveMacros` — align consecutive macros
- `AlignEscapedNewlines` — align escaped newlines
- `AlignOperands` — align operands
- `AlignTrailingComments` — align trailing comments

### 7. General
- `BasedOnStyle` — base style
- `Language` — target language
- `Standard` — C++ standard version
- `ColumnLimit` — column limit
- `DerivePointerAlignment` — derive pointer alignment from code
- `LineEnding` — line ending style
- `DisableFormat` — disable formatting
- `FixNamespaceComments` — fix namespace closing comments
- `SortIncludes` — sort `#include` directives
- `SortUsingDeclarations` — sort `using` declarations
- `IncludeBlocks` — include block handling
- `ReflowComments` — reflow comments
- `InsertBraces` — insert braces around control statements
- `InsertNewlineAtEOF` — insert newline at end of file
- `RemoveBracesLLVM` — remove redundant braces (LLVM style)
- `RemoveSemicolon` — remove redundant semicolons
- `QualifierAlignment` — qualifier alignment

## UI Design Spec

### Layout
- **Left**: Category navigation (CLion-style tree settings sidebar)
- **Center**: Option editing panel (form controls)
- **Right**: Code preview panel (live formatting result)

### Control Types
- **Dropdown select**: Enum options (e.g. `BreakBeforeBraces`)
- **Number input**: Integer options (e.g. `IndentWidth`)
- **Toggle switch**: Boolean options (e.g. `SpaceAfterCStyleCast`)
- **Text input**: String options (e.g. `CommentPragmas`)
- **Nested panel**: Composite options (e.g. `BraceWrapping` sub-options, shown only when `BreakBeforeBraces = Custom`)

### Themes
- Supports light and dark themes
- Defaults to dark theme (IDE-style)
- Theme persisted to `localStorage`

## Coding Conventions

### Frontend (TypeScript / Vue)
- Use Composition API with `<script setup>` syntax
- Component names in PascalCase
- Type definitions under `src/types/`
- Shared logic extracted to composables under `src/composables/`
- Global state via Pinia
- CSS via BEM naming or scoped styles
- Prefer `pnpm` over `npm` 

### Backend (Rust)
- Follow standard Rust style (rustfmt)
- Tauri commands use the `#[tauri::command]` macro
- Error handling via `Result<T, String>` or custom error types
- Config models use serde for serialization/deserialization

## Development Commands

```bash
# Install dependencies
pnpm install

# Development mode (hot-reload)
pnpm run tauri dev

# Build production installer
pnpm run tauri build
```

## Key References

- [clang-format Style Options](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)
- [CLion Code Style C/C++](https://www.jetbrains.com/help/clion/code-style-c-c.html)
- [Tauri v2 Documentation](https://v2.tauri.app/)
- [Vue 3 Documentation](https://vuejs.org/)
