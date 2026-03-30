# Clang-Format Editor

> 一款用于可视化编辑 clang-format 代码风格配置的桌面应用，类似于 JetBrains CLion 的 **Settings | Editor | Code Style | C/C++** 面板。

基于 **Tauri v2** + **Vue 3** + **TypeScript** 构建。

[English](README.md) | 中文

---

## 功能特性

- **可视化编辑** — 覆盖 6 大分类的主要 clang-format 选项
- **实时预览** — 调用本机安装的 `clang-format` 对示例 C++ 代码实时格式化
- **7 种预设风格** — LLVM、Google、Chromium、Mozilla、WebKit、Microsoft、GNU
- **智能导出** — 仅导出与所选基础风格不同的选项，保持文件简洁
- **导入** — 直接加载已有的 `.clang-format` 文件
- **语法高亮** — 使用 [Shiki](https://shiki.style/) 高亮显示代码预览和 YAML 输出
- **亮色 / 暗色主题** 切换（持久化保存）

## 选项分类

| 分类 | 主要选项 |
|---|---|
| **通用** | `BasedOnStyle`、`Language`、`Standard`、`ColumnLimit`、`LineEnding` |
| **缩进与制表符** | `IndentWidth`、`UseTab`、`TabWidth`、`ContinuationIndentWidth`、`AccessModifierOffset` |
| **空格** | `PointerAlignment`、`SpaceBeforeParens`、`SpacesInAngles`、`SpacesInParens` |
| **换行与花括号** | `BreakBeforeBraces`、`BraceWrapping`、`AllowShort*`、`Break*`、`BinPack*` |
| **空行** | `MaxEmptyLinesToKeep`、`EmptyLineBeforeAccessModifier`、`SeparateDefinitionBlocks` |
| **对齐** | `AlignConsecutive*`、`AlignTrailingComments`、`AlignOperands` |

## 环境要求

| 工具 | 要求 |
|---|---|
| [Node.js](https://nodejs.org/) | ≥ 18 |
| [Rust](https://rustup.rs/) | stable（通过 `rustup` 安装） |
| [clang-format](https://clang.llvm.org/docs/ClangFormat.html) | 任意版本（实时预览所需） |

> **Windows 用户**：在安装 Rust 之前，请先安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)，并勾选 **使用 C++ 的桌面开发** 工作负载。

## 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/your-name/clang-format-editor.git
cd clang-format-editor

# 2. 安装 Node 依赖
npm install
```

## 运行

```bash
# 开发模式 — 前端与 Rust 后端均支持热重载
npm run tauri dev
```

Vite 会在 `http://localhost:1420` 启动，Tauri 自动打开桌面窗口。  
实时预览功能需要将 `clang-format` 加入系统 `PATH`。

## 构建

```bash
# 构建生产环境桌面安装包
npm run tauri build
```

输出文件位于 `src-tauri/target/release/bundle/`。

## 项目结构

```
clang-format-editor/
├── src/                         # Vue 3 前端
│   ├── App.vue                  # 根组件 — 三栏布局
│   ├── main.ts                  # 入口；Router + Pinia 初始化
│   ├── assets/styles/           # SCSS 变量（主题）+ 全局样式
│   ├── components/
│   │   ├── CodePreview.vue      # Shiki 语法高亮代码 / YAML 预览
│   │   ├── OptionControl.vue    # 通用表单控件（开关/下拉/数字/文本）
│   │   ├── OptionGroup.vue      # 可折叠选项分组容器
│   │   ├── SideNav.vue          # 左侧导航栏
│   │   └── Toolbar.vue          # 顶部工具栏（预设、导入、导出、主题）
│   ├── stores/formatStore.ts    # Pinia store — 配置状态、YAML 导入导出
│   ├── types/clangFormat.ts     # 所有选项的 TypeScript 类型定义
│   ├── data/
│   │   ├── presets.ts           # LLVM 默认值 + 各预设覆盖对象
│   │   └── sampleCode.ts        # 预览面板示例 C++ 代码
│   └── views/                   # 每个分类对应一个页面
│       ├── General.vue
│       ├── TabsAndIndents.vue
│       ├── Spaces.vue
│       ├── WrappingAndBraces.vue
│       ├── BlankLines.vue
│       └── Alignment.vue
├── src-tauri/                   # Tauri / Rust 后端
│   ├── src/
│   │   ├── main.rs              # 入口
│   │   ├── lib.rs               # 插件注册
│   │   └── commands/mod.rs      # format_code、get_clang_format_version 命令
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── index.html
```

## 技术栈

| 层级 | 技术 |
|---|---|
| 桌面外壳 | [Tauri v2](https://v2.tauri.app/)（Rust） |
| 前端 | [Vue 3](https://vuejs.org/) + TypeScript |
| 状态管理 | [Pinia](https://pinia.vuejs.org/) |
| 构建工具 | [Vite](https://vitejs.dev/) |
| 语法高亮 | [Shiki](https://shiki.style/) |
| YAML | [js-yaml](https://github.com/nodeca/js-yaml) |
| 样式 | SCSS + CSS 自定义属性 |

## 参考资料

- [clang-format Style Options](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)
- [Tauri v2 文档](https://v2.tauri.app/)
- [Vue 3 文档](https://vuejs.org/)

## 许可证

MIT
