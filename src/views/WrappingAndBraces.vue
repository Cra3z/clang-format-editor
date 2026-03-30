<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import { computed } from 'vue'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'

const store = useFormatStore()

const isCustomBraces = computed(() => store.config.BreakBeforeBraces === 'Custom')

function setBraceWrapping(key: string, value: unknown) {
  const current = store.config.BraceWrapping ?? {}
  store.setOption('BraceWrapping', { ...current, [key]: value })
}

function getBraceWrapping(key: string): unknown {
  return (store.config.BraceWrapping as any)?.[key]
}
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">换行与花括号</h2>

    <OptionGroup label="花括号风格">
      <OptionControl
        label="BreakBeforeBraces"
        description="花括号换行风格"
        type="enum"
        :modelValue="store.config.BreakBeforeBraces"
        :enumValues="['Attach', 'Linux', 'Mozilla', 'Stroustrup', 'Allman', 'Whitesmiths', 'GNU', 'WebKit', 'Custom']"
        @update:modelValue="store.setOption('BreakBeforeBraces', $event as any)"
      />
      <OptionControl
        label="Cpp11BracedListStyle"
        description="C++11 花括号列表风格"
        type="boolean"
        :modelValue="!!store.config.Cpp11BracedListStyle"
        @update:modelValue="store.setOption('Cpp11BracedListStyle', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup v-if="isCustomBraces" label="BraceWrapping 自定义">
      <OptionControl label="AfterCaseLabel" description="case 标签后花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('AfterCaseLabel')" @update:modelValue="setBraceWrapping('AfterCaseLabel', $event)" />
      <OptionControl label="AfterClass" description="class 后花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('AfterClass')" @update:modelValue="setBraceWrapping('AfterClass', $event)" />
      <OptionControl label="AfterControlStatement" description="控制语句后花括号换行" type="enum"
        :modelValue="getBraceWrapping('AfterControlStatement') ?? 'Never'" :enumValues="['Never', 'MultiLine', 'Always']"
        @update:modelValue="setBraceWrapping('AfterControlStatement', $event)" />
      <OptionControl label="AfterEnum" description="enum 后花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('AfterEnum')" @update:modelValue="setBraceWrapping('AfterEnum', $event)" />
      <OptionControl label="AfterFunction" description="函数后花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('AfterFunction')" @update:modelValue="setBraceWrapping('AfterFunction', $event)" />
      <OptionControl label="AfterNamespace" description="namespace 后花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('AfterNamespace')" @update:modelValue="setBraceWrapping('AfterNamespace', $event)" />
      <OptionControl label="AfterStruct" description="struct 后花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('AfterStruct')" @update:modelValue="setBraceWrapping('AfterStruct', $event)" />
      <OptionControl label="AfterUnion" description="union 后花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('AfterUnion')" @update:modelValue="setBraceWrapping('AfterUnion', $event)" />
      <OptionControl label="AfterExternBlock" description="extern 块后花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('AfterExternBlock')" @update:modelValue="setBraceWrapping('AfterExternBlock', $event)" />
      <OptionControl label="BeforeCatch" description="catch 前花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('BeforeCatch')" @update:modelValue="setBraceWrapping('BeforeCatch', $event)" />
      <OptionControl label="BeforeElse" description="else 前花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('BeforeElse')" @update:modelValue="setBraceWrapping('BeforeElse', $event)" />
      <OptionControl label="BeforeLambdaBody" description="Lambda 体前花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('BeforeLambdaBody')" @update:modelValue="setBraceWrapping('BeforeLambdaBody', $event)" />
      <OptionControl label="BeforeWhile" description="do-while 的 while 前花括号换行" type="boolean"
        :modelValue="!!getBraceWrapping('BeforeWhile')" @update:modelValue="setBraceWrapping('BeforeWhile', $event)" />
      <OptionControl label="IndentBraces" description="缩进花括号" type="boolean"
        :modelValue="!!getBraceWrapping('IndentBraces')" @update:modelValue="setBraceWrapping('IndentBraces', $event)" />
      <OptionControl label="SplitEmptyFunction" description="空函数花括号分行" type="boolean"
        :modelValue="!!getBraceWrapping('SplitEmptyFunction')" @update:modelValue="setBraceWrapping('SplitEmptyFunction', $event)" />
      <OptionControl label="SplitEmptyRecord" description="空记录花括号分行" type="boolean"
        :modelValue="!!getBraceWrapping('SplitEmptyRecord')" @update:modelValue="setBraceWrapping('SplitEmptyRecord', $event)" />
      <OptionControl label="SplitEmptyNamespace" description="空命名空间花括号分行" type="boolean"
        :modelValue="!!getBraceWrapping('SplitEmptyNamespace')" @update:modelValue="setBraceWrapping('SplitEmptyNamespace', $event)" />
    </OptionGroup>

    <OptionGroup label="短语句单行">
      <OptionControl
        label="AllowShortFunctionsOnASingleLine"
        description="短函数置于单行"
        type="enum"
        :modelValue="store.config.AllowShortFunctionsOnASingleLine"
        :enumValues="['None', 'InlineOnly', 'Empty', 'Inline', 'All']"
        @update:modelValue="store.setOption('AllowShortFunctionsOnASingleLine', $event as any)"
      />
      <OptionControl
        label="AllowShortIfStatementsOnASingleLine"
        description="短 if 语句置于单行"
        type="enum"
        :modelValue="store.config.AllowShortIfStatementsOnASingleLine"
        :enumValues="['Never', 'WithoutElse', 'OnlyFirstIf', 'AllIfsAndElse']"
        @update:modelValue="store.setOption('AllowShortIfStatementsOnASingleLine', $event as any)"
      />
      <OptionControl
        label="AllowShortLoopsOnASingleLine"
        description="短循环置于单行"
        type="boolean"
        :modelValue="store.config.AllowShortLoopsOnASingleLine"
        @update:modelValue="store.setOption('AllowShortLoopsOnASingleLine', $event as boolean)"
      />
      <OptionControl
        label="AllowShortBlocksOnASingleLine"
        description="短代码块置于单行"
        type="enum"
        :modelValue="store.config.AllowShortBlocksOnASingleLine"
        :enumValues="['Never', 'Empty', 'Always']"
        @update:modelValue="store.setOption('AllowShortBlocksOnASingleLine', $event as any)"
      />
      <OptionControl
        label="AllowShortCaseLabelsOnASingleLine"
        description="短 case 标签置于单行"
        type="boolean"
        :modelValue="store.config.AllowShortCaseLabelsOnASingleLine"
        @update:modelValue="store.setOption('AllowShortCaseLabelsOnASingleLine', $event as boolean)"
      />
      <OptionControl
        label="AllowShortLambdasOnASingleLine"
        description="短 Lambda 置于单行"
        type="enum"
        :modelValue="store.config.AllowShortLambdasOnASingleLine"
        :enumValues="['None', 'Empty', 'Inline', 'All']"
        @update:modelValue="store.setOption('AllowShortLambdasOnASingleLine', $event as any)"
      />
      <OptionControl
        label="AllowShortEnumsOnASingleLine"
        description="短枚举置于单行"
        type="boolean"
        :modelValue="store.config.AllowShortEnumsOnASingleLine"
        @update:modelValue="store.setOption('AllowShortEnumsOnASingleLine', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup label="换行控制">
      <OptionControl
        label="BreakBeforeBinaryOperators"
        description="二元运算符前换行"
        type="enum"
        :modelValue="store.config.BreakBeforeBinaryOperators"
        :enumValues="['None', 'NonAssignment', 'All']"
        @update:modelValue="store.setOption('BreakBeforeBinaryOperators', $event as any)"
      />
      <OptionControl
        label="BreakBeforeTernaryOperators"
        description="三元运算符前换行"
        type="boolean"
        :modelValue="store.config.BreakBeforeTernaryOperators"
        @update:modelValue="store.setOption('BreakBeforeTernaryOperators', $event as boolean)"
      />
      <OptionControl
        label="BreakConstructorInitializers"
        description="构造函数初始化列表换行方式"
        type="enum"
        :modelValue="store.config.BreakConstructorInitializers"
        :enumValues="['BeforeColon', 'BeforeComma', 'AfterColon', 'AfterComma']"
        @update:modelValue="store.setOption('BreakConstructorInitializers', $event as any)"
      />
      <OptionControl
        label="BreakInheritanceList"
        description="继承列表换行方式"
        type="enum"
        :modelValue="store.config.BreakInheritanceList"
        :enumValues="['BeforeColon', 'BeforeComma', 'AfterColon', 'AfterComma']"
        @update:modelValue="store.setOption('BreakInheritanceList', $event as any)"
      />
      <OptionControl
        label="BreakTemplateDeclarations"
        description="模板声明换行方式"
        type="enum"
        :modelValue="store.config.BreakTemplateDeclarations"
        :enumValues="['Leave', 'No', 'MultiLine', 'Yes']"
        @update:modelValue="store.setOption('BreakTemplateDeclarations', $event as any)"
      />
      <OptionControl
        label="BreakStringLiterals"
        description="字符串字面量自动换行"
        type="boolean"
        :modelValue="store.config.BreakStringLiterals"
        @update:modelValue="store.setOption('BreakStringLiterals', $event as boolean)"
      />
      <OptionControl
        label="BreakAfterReturnType"
        description="返回类型后换行方式"
        type="enum"
        :modelValue="store.config.BreakAfterReturnType"
        :enumValues="['None', 'Automatic', 'ExceptShortType', 'All', 'TopLevel', 'AllDefinitions', 'TopLevelDefinitions']"
        @update:modelValue="store.setOption('BreakAfterReturnType', $event as any)"
      />
      <OptionControl
        label="AlwaysBreakBeforeMultilineStrings"
        description="多行字符串前强制换行"
        type="boolean"
        :modelValue="store.config.AlwaysBreakBeforeMultilineStrings"
        @update:modelValue="store.setOption('AlwaysBreakBeforeMultilineStrings', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup label="参数打包">
      <OptionControl
        label="BinPackArguments"
        description="函数调用参数打包"
        type="boolean"
        :modelValue="store.config.BinPackArguments"
        @update:modelValue="store.setOption('BinPackArguments', $event as boolean)"
      />
      <OptionControl
        label="BinPackParameters"
        description="函数声明参数打包"
        type="enum"
        :modelValue="String(store.config.BinPackParameters)"
        :enumValues="['BinPack', 'OnePerLine', 'AlwaysOnePerLine', 'true', 'false']"
        @update:modelValue="store.setOption('BinPackParameters', $event === 'true' ? true : $event === 'false' ? false : $event as any)"
      />
      <OptionControl
        label="PackConstructorInitializers"
        description="构造函数初始化列表打包方式"
        type="enum"
        :modelValue="store.config.PackConstructorInitializers"
        :enumValues="['Never', 'BinPack', 'CurrentLine', 'NextLine', 'NextLineOnly']"
        @update:modelValue="store.setOption('PackConstructorInitializers', $event as any)"
      />
      <OptionControl
        label="AllowAllArgumentsOnNextLine"
        description="允许所有参数放在下一行"
        type="boolean"
        :modelValue="store.config.AllowAllArgumentsOnNextLine"
        @update:modelValue="store.setOption('AllowAllArgumentsOnNextLine', $event as boolean)"
      />
      <OptionControl
        label="AllowAllParametersOfDeclarationOnNextLine"
        description="允许函数声明的所有参数放在下一行"
        type="boolean"
        :modelValue="store.config.AllowAllParametersOfDeclarationOnNextLine"
        @update:modelValue="store.setOption('AllowAllParametersOfDeclarationOnNextLine', $event as boolean)"
      />
      <OptionControl
        label="BreakFunctionDefinitionParameters"
        description="函数定义参数前强制换行"
        type="boolean"
        :modelValue="store.config.BreakFunctionDefinitionParameters"
        @update:modelValue="store.setOption('BreakFunctionDefinitionParameters', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup label="命名空间">
      <OptionControl
        label="CompactNamespaces"
        description="紧凑命名空间声明"
        type="boolean"
        :modelValue="store.config.CompactNamespaces"
        @update:modelValue="store.setOption('CompactNamespaces', $event as boolean)"
      />
    </OptionGroup>
  </div>
</template>

<style scoped lang="scss">
.view-page {
  max-width: 700px;
}
.page-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}
</style>
