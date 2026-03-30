/**
 * clang-format 选项的 TypeScript 类型定义
 */

// ===== 枚举类型 =====

export type BasedOnStyle = 'LLVM' | 'Google' | 'Chromium' | 'Mozilla' | 'WebKit' | 'Microsoft' | 'GNU'

export type UseTabStyle = 'Never' | 'ForIndentation' | 'ForContinuationAndIndentation' | 'AlignWithSpaces' | 'Always'

export type BreakBeforeBracesStyle =
  | 'Attach' | 'Linux' | 'Mozilla' | 'Stroustrup' | 'Allman'
  | 'Whitesmiths' | 'GNU' | 'WebKit' | 'Custom'

export type PointerAlignmentStyle = 'Left' | 'Right' | 'Middle'
export type ReferenceAlignmentStyle = 'Pointer' | 'Left' | 'Right' | 'Middle'

export type SpaceBeforeParensStyle =
  | 'Never' | 'ControlStatements' | 'ControlStatementsExceptControlMacros'
  | 'NonEmptyParentheses' | 'Always' | 'Custom'

export type BinaryOperatorStyle = 'None' | 'NonAssignment' | 'All'
export type BreakConstructorInitializersStyle = 'BeforeColon' | 'BeforeComma' | 'AfterColon' | 'AfterComma'
export type BreakInheritanceListStyle = 'BeforeColon' | 'BeforeComma' | 'AfterColon' | 'AfterComma'
export type BreakTemplateDeclarationsStyle = 'Leave' | 'No' | 'MultiLine' | 'Yes'

export type ShortFunctionStyle = 'None' | 'InlineOnly' | 'Empty' | 'Inline' | 'All'
export type ShortIfStyle = 'Never' | 'WithoutElse' | 'OnlyFirstIf' | 'AllIfsAndElse'
export type ShortLambdaStyle = 'None' | 'Empty' | 'Inline' | 'All'
export type ShortBlockStyle = 'Never' | 'Empty' | 'Always'

export type AlignEscapedNewlinesStyle = 'DontAlign' | 'Left' | 'LeftWithLastLine' | 'Right'
export type AlignOperandsStyle = 'DontAlign' | 'Align' | 'AlignAfterOperator'
export type ArrayInitAlignStyle = 'Left' | 'Right' | 'None'

export type SpacesInAnglesStyle = 'Never' | 'Always' | 'Leave'
export type SpacesInParensStyle = 'Never' | 'Custom'

export type PPDirectiveIndentStyle = 'None' | 'AfterHash' | 'BeforeHash' | 'Leave'
export type NamespaceIndentKind = 'None' | 'Inner' | 'All'
export type IndentExternBlockStyle = 'AfterExternBlock' | 'NoIndent' | 'Indent'
export type LambdaBodyIndentKind = 'Signature' | 'OuterScope'
export type IndentGotoLabelStyle = 'NoIndent' | 'OuterIndent' | 'InnerIndent' | 'HalfIndent'

export type ReturnTypeBreakingStyle = 'None' | 'Automatic' | 'ExceptShortType' | 'All' | 'TopLevel' | 'AllDefinitions' | 'TopLevelDefinitions'

export type SortIncludesStyle = 'Never' | 'CaseSensitive' | 'CaseInsensitive'
export type SortUsingDeclarationsStyle = 'Never' | 'Lexicographic' | 'LexicographicNumeric'
export type IncludeBlocksStyle = 'Preserve' | 'Merge' | 'Regroup'

export type EmptyLineAfterAccessModifierStyle = 'Never' | 'Leave' | 'Always'
export type EmptyLineBeforeAccessModifierStyle = 'Never' | 'Leave' | 'LogicalBlock' | 'Always'
export type SeparateDefinitionStyle = 'Leave' | 'Always' | 'Never'

export type QualifierAlignmentStyle = 'Leave' | 'Left' | 'Right' | 'Custom'
export type ReflowCommentsStyle = 'Never' | 'IndentOnly' | 'Always'
export type LineEndingStyle = 'LF' | 'CRLF' | 'DeriveLF' | 'DeriveCRLF'
export type LanguageKind = 'None' | 'C' | 'Cpp' | 'CSharp' | 'Java' | 'JavaScript' | 'Json' | 'ObjC' | 'Proto' | 'TableGen' | 'TextProto' | 'Verilog'
export type LanguageStandard = 'c++03' | 'c++11' | 'c++14' | 'c++17' | 'c++20' | 'Latest' | 'Auto'

export type PackConstructorInitializersStyle = 'Never' | 'BinPack' | 'CurrentLine' | 'NextLine' | 'NextLineOnly'
export type BinPackParametersStyle = 'BinPack' | 'OnePerLine' | 'AlwaysOnePerLine'
export type BitFieldColonSpacingStyle = 'Both' | 'None' | 'Before' | 'After'
export type SpaceAroundPointerQualifiersStyle = 'Default' | 'Before' | 'After' | 'Both'

export type BracedListStyle = 'Block' | 'FunctionCall' | 'AlignFirstComment'

export type TrailingCommentsAlignmentKind = 'Leave' | 'Always' | 'Never'

// ===== 复合类型 =====

export interface AlignConsecutiveStyle {
  Enabled: boolean
  AcrossEmptyLines: boolean
  AcrossComments: boolean
  AlignCompound?: boolean
  PadOperators?: boolean
  AlignFunctionDeclarations?: boolean
  AlignFunctionPointers?: boolean
}

export interface BraceWrappingFlags {
  AfterCaseLabel: boolean
  AfterClass: boolean
  AfterControlStatement: 'Never' | 'MultiLine' | 'Always'
  AfterEnum: boolean
  AfterFunction: boolean
  AfterNamespace: boolean
  AfterStruct: boolean
  AfterUnion: boolean
  AfterExternBlock: boolean
  BeforeCatch: boolean
  BeforeElse: boolean
  BeforeLambdaBody: boolean
  BeforeWhile: boolean
  IndentBraces: boolean
  SplitEmptyFunction: boolean
  SplitEmptyRecord: boolean
  SplitEmptyNamespace: boolean
}

export interface TrailingCommentsAlignmentStyle {
  Kind: TrailingCommentsAlignmentKind
  OverEmptyLines: number
}

export interface KeepEmptyLinesStyle {
  AtEndOfFile: boolean
  AtStartOfBlock: boolean
  AtStartOfFile: boolean
}

// ===== 主配置接口 =====

export interface ClangFormatConfig {
  // General
  BasedOnStyle?: BasedOnStyle
  Language?: LanguageKind
  Standard?: LanguageStandard
  ColumnLimit?: number
  LineEnding?: LineEndingStyle
  DisableFormat?: boolean

  // Tabs and Indents
  UseTab?: UseTabStyle
  IndentWidth?: number
  TabWidth?: number
  ContinuationIndentWidth?: number
  ConstructorInitializerIndentWidth?: number
  IndentCaseLabels?: boolean
  IndentCaseBlocks?: boolean
  IndentAccessModifiers?: boolean
  AccessModifierOffset?: number
  IndentPPDirectives?: PPDirectiveIndentStyle
  PPIndentWidth?: number
  IndentWrappedFunctionNames?: boolean
  IndentExternBlock?: IndentExternBlockStyle
  IndentGotoLabels?: IndentGotoLabelStyle
  IndentRequiresClause?: boolean
  NamespaceIndentation?: NamespaceIndentKind
  LambdaBodyIndentation?: LambdaBodyIndentKind
  IndentExportBlock?: boolean

  // Spaces
  SpaceAfterCStyleCast?: boolean
  SpaceAfterLogicalNot?: boolean
  SpaceAfterTemplateKeyword?: boolean
  SpaceAfterOperatorKeyword?: boolean
  SpaceBeforeAssignmentOperators?: boolean
  SpaceBeforeCaseColon?: boolean
  SpaceBeforeCpp11BracedList?: boolean
  SpaceBeforeCtorInitializerColon?: boolean
  SpaceBeforeInheritanceColon?: boolean
  SpaceBeforeParens?: SpaceBeforeParensStyle
  SpaceBeforeRangeBasedForLoopColon?: boolean
  SpaceBeforeSquareBrackets?: boolean
  SpacesInAngles?: SpacesInAnglesStyle
  SpacesInParens?: SpacesInParensStyle
  SpacesInSquareBrackets?: boolean
  SpacesBeforeTrailingComments?: number
  BitFieldColonSpacing?: BitFieldColonSpacingStyle
  PointerAlignment?: PointerAlignmentStyle
  ReferenceAlignment?: ReferenceAlignmentStyle
  SpaceAroundPointerQualifiers?: SpaceAroundPointerQualifiersStyle
  DerivePointerAlignment?: boolean
  SpaceInEmptyBlock?: boolean

  // Wrapping and Braces
  BreakBeforeBraces?: BreakBeforeBracesStyle
  BraceWrapping?: Partial<BraceWrappingFlags>
  AllowShortFunctionsOnASingleLine?: ShortFunctionStyle
  AllowShortIfStatementsOnASingleLine?: ShortIfStyle
  AllowShortLoopsOnASingleLine?: boolean
  AllowShortBlocksOnASingleLine?: ShortBlockStyle
  AllowShortCaseLabelsOnASingleLine?: boolean
  AllowShortLambdasOnASingleLine?: ShortLambdaStyle
  AllowShortEnumsOnASingleLine?: boolean
  BreakBeforeBinaryOperators?: BinaryOperatorStyle
  BreakBeforeTernaryOperators?: boolean
  BreakConstructorInitializers?: BreakConstructorInitializersStyle
  BreakInheritanceList?: BreakInheritanceListStyle
  BreakTemplateDeclarations?: BreakTemplateDeclarationsStyle
  BreakStringLiterals?: boolean
  BreakAfterReturnType?: ReturnTypeBreakingStyle
  BinPackArguments?: boolean
  BinPackParameters?: BinPackParametersStyle | boolean
  PackConstructorInitializers?: PackConstructorInitializersStyle
  AlwaysBreakBeforeMultilineStrings?: boolean
  Cpp11BracedListStyle?: BracedListStyle | boolean
  AllowAllArgumentsOnNextLine?: boolean
  AllowAllParametersOfDeclarationOnNextLine?: boolean
  BreakFunctionDefinitionParameters?: boolean
  CompactNamespaces?: boolean

  // Blank Lines
  MaxEmptyLinesToKeep?: number
  KeepEmptyLines?: Partial<KeepEmptyLinesStyle>
  EmptyLineAfterAccessModifier?: EmptyLineAfterAccessModifierStyle
  EmptyLineBeforeAccessModifier?: EmptyLineBeforeAccessModifierStyle
  SeparateDefinitionBlocks?: SeparateDefinitionStyle

  // Alignment
  AlignAfterOpenBracket?: 'Align' | 'DontAlign' | 'AlwaysBreak' | 'BlockIndent'
  AlignArrayOfStructures?: ArrayInitAlignStyle
  AlignConsecutiveAssignments?: AlignConsecutiveStyle | string
  AlignConsecutiveBitFields?: AlignConsecutiveStyle | string
  AlignConsecutiveDeclarations?: AlignConsecutiveStyle | string
  AlignConsecutiveMacros?: AlignConsecutiveStyle | string
  AlignEscapedNewlines?: AlignEscapedNewlinesStyle
  AlignOperands?: AlignOperandsStyle
  AlignTrailingComments?: TrailingCommentsAlignmentStyle | boolean

  // Other
  FixNamespaceComments?: boolean
  SortIncludes?: SortIncludesStyle | boolean
  SortUsingDeclarations?: SortUsingDeclarationsStyle | boolean
  IncludeBlocks?: IncludeBlocksStyle
  ReflowComments?: ReflowCommentsStyle | boolean
  InsertBraces?: boolean
  InsertNewlineAtEOF?: boolean
  RemoveBracesLLVM?: boolean
  RemoveSemicolon?: boolean
  QualifierAlignment?: QualifierAlignmentStyle

  // Allow arbitrary extra keys
  [key: string]: unknown
}

// ===== 选项元信息（用于 UI 渲染） =====

export type OptionType = 'boolean' | 'integer' | 'enum' | 'string' | 'composite'

export interface OptionMeta {
  key: string
  label: string
  description: string
  type: OptionType
  enumValues?: string[]
  defaultValue?: unknown
  min?: number
  max?: number
  category: OptionCategory
  subOptions?: OptionMeta[]
}

export type OptionCategory =
  | 'general'
  | 'tabs-and-indents'
  | 'spaces'
  | 'wrapping-and-braces'
  | 'blank-lines'
  | 'alignment'
