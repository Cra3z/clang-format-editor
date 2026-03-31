<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import { computed } from 'vue'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'
import { useI18n } from 'vue-i18n'

const store = useFormatStore()
const { t } = useI18n()

const isCustomBraces = computed(() => store.config.BreakBeforeBraces === 'Custom')

function optionDescription(key: string) {
  return t(`views.wrappingAndBraces.options.${key}`)
}

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
    <h2 class="page-title">{{ t('views.wrappingAndBraces.title') }}</h2>

    <OptionGroup :label="t('views.wrappingAndBraces.groups.braces')">
      <OptionControl
        label="BreakBeforeBraces"
        :description="optionDescription('BreakBeforeBraces')"
        type="enum"
        :modelValue="store.config.BreakBeforeBraces"
        :enumValues="['Attach', 'Linux', 'Mozilla', 'Stroustrup', 'Allman', 'Whitesmiths', 'GNU', 'WebKit', 'Custom']"
        @update:modelValue="store.setOption('BreakBeforeBraces', $event as any)"
      />
      <OptionControl
        label="Cpp11BracedListStyle"
        :description="optionDescription('Cpp11BracedListStyle')"
        type="boolean"
        :modelValue="!!store.config.Cpp11BracedListStyle"
        @update:modelValue="store.setOption('Cpp11BracedListStyle', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup v-if="isCustomBraces" :label="t('views.wrappingAndBraces.groups.customBraces')">
      <OptionControl label="AfterCaseLabel" :description="optionDescription('AfterCaseLabel')" type="boolean"
        :modelValue="!!getBraceWrapping('AfterCaseLabel')" @update:modelValue="setBraceWrapping('AfterCaseLabel', $event)" />
      <OptionControl label="AfterClass" :description="optionDescription('AfterClass')" type="boolean"
        :modelValue="!!getBraceWrapping('AfterClass')" @update:modelValue="setBraceWrapping('AfterClass', $event)" />
      <OptionControl label="AfterControlStatement" :description="optionDescription('AfterControlStatement')" type="enum"
        :modelValue="getBraceWrapping('AfterControlStatement') ?? 'Never'" :enumValues="['Never', 'MultiLine', 'Always']"
        @update:modelValue="setBraceWrapping('AfterControlStatement', $event)" />
      <OptionControl label="AfterEnum" :description="optionDescription('AfterEnum')" type="boolean"
        :modelValue="!!getBraceWrapping('AfterEnum')" @update:modelValue="setBraceWrapping('AfterEnum', $event)" />
      <OptionControl label="AfterFunction" :description="optionDescription('AfterFunction')" type="boolean"
        :modelValue="!!getBraceWrapping('AfterFunction')" @update:modelValue="setBraceWrapping('AfterFunction', $event)" />
      <OptionControl label="AfterNamespace" :description="optionDescription('AfterNamespace')" type="boolean"
        :modelValue="!!getBraceWrapping('AfterNamespace')" @update:modelValue="setBraceWrapping('AfterNamespace', $event)" />
      <OptionControl label="AfterStruct" :description="optionDescription('AfterStruct')" type="boolean"
        :modelValue="!!getBraceWrapping('AfterStruct')" @update:modelValue="setBraceWrapping('AfterStruct', $event)" />
      <OptionControl label="AfterUnion" :description="optionDescription('AfterUnion')" type="boolean"
        :modelValue="!!getBraceWrapping('AfterUnion')" @update:modelValue="setBraceWrapping('AfterUnion', $event)" />
      <OptionControl label="AfterExternBlock" :description="optionDescription('AfterExternBlock')" type="boolean"
        :modelValue="!!getBraceWrapping('AfterExternBlock')" @update:modelValue="setBraceWrapping('AfterExternBlock', $event)" />
      <OptionControl label="BeforeCatch" :description="optionDescription('BeforeCatch')" type="boolean"
        :modelValue="!!getBraceWrapping('BeforeCatch')" @update:modelValue="setBraceWrapping('BeforeCatch', $event)" />
      <OptionControl label="BeforeElse" :description="optionDescription('BeforeElse')" type="boolean"
        :modelValue="!!getBraceWrapping('BeforeElse')" @update:modelValue="setBraceWrapping('BeforeElse', $event)" />
      <OptionControl label="BeforeLambdaBody" :description="optionDescription('BeforeLambdaBody')" type="boolean"
        :modelValue="!!getBraceWrapping('BeforeLambdaBody')" @update:modelValue="setBraceWrapping('BeforeLambdaBody', $event)" />
      <OptionControl label="BeforeWhile" :description="optionDescription('BeforeWhile')" type="boolean"
        :modelValue="!!getBraceWrapping('BeforeWhile')" @update:modelValue="setBraceWrapping('BeforeWhile', $event)" />
      <OptionControl label="IndentBraces" :description="optionDescription('IndentBraces')" type="boolean"
        :modelValue="!!getBraceWrapping('IndentBraces')" @update:modelValue="setBraceWrapping('IndentBraces', $event)" />
      <OptionControl label="SplitEmptyFunction" :description="optionDescription('SplitEmptyFunction')" type="boolean"
        :modelValue="!!getBraceWrapping('SplitEmptyFunction')" @update:modelValue="setBraceWrapping('SplitEmptyFunction', $event)" />
      <OptionControl label="SplitEmptyRecord" :description="optionDescription('SplitEmptyRecord')" type="boolean"
        :modelValue="!!getBraceWrapping('SplitEmptyRecord')" @update:modelValue="setBraceWrapping('SplitEmptyRecord', $event)" />
      <OptionControl label="SplitEmptyNamespace" :description="optionDescription('SplitEmptyNamespace')" type="boolean"
        :modelValue="!!getBraceWrapping('SplitEmptyNamespace')" @update:modelValue="setBraceWrapping('SplitEmptyNamespace', $event)" />
    </OptionGroup>

    <OptionGroup :label="t('views.wrappingAndBraces.groups.shortStatements')">
      <OptionControl
        label="AllowShortFunctionsOnASingleLine"
        :description="optionDescription('AllowShortFunctionsOnASingleLine')"
        type="enum"
        :modelValue="store.config.AllowShortFunctionsOnASingleLine"
        :enumValues="['None', 'InlineOnly', 'Empty', 'Inline', 'All']"
        @update:modelValue="store.setOption('AllowShortFunctionsOnASingleLine', $event as any)"
      />
      <OptionControl
        label="AllowShortIfStatementsOnASingleLine"
        :description="optionDescription('AllowShortIfStatementsOnASingleLine')"
        type="enum"
        :modelValue="store.config.AllowShortIfStatementsOnASingleLine"
        :enumValues="['Never', 'WithoutElse', 'OnlyFirstIf', 'AllIfsAndElse']"
        @update:modelValue="store.setOption('AllowShortIfStatementsOnASingleLine', $event as any)"
      />
      <OptionControl
        label="AllowShortLoopsOnASingleLine"
        :description="optionDescription('AllowShortLoopsOnASingleLine')"
        type="boolean"
        :modelValue="store.config.AllowShortLoopsOnASingleLine"
        @update:modelValue="store.setOption('AllowShortLoopsOnASingleLine', $event as boolean)"
      />
      <OptionControl
        label="AllowShortBlocksOnASingleLine"
        :description="optionDescription('AllowShortBlocksOnASingleLine')"
        type="enum"
        :modelValue="store.config.AllowShortBlocksOnASingleLine"
        :enumValues="['Never', 'Empty', 'Always']"
        @update:modelValue="store.setOption('AllowShortBlocksOnASingleLine', $event as any)"
      />
      <OptionControl
        label="AllowShortCaseLabelsOnASingleLine"
        :description="optionDescription('AllowShortCaseLabelsOnASingleLine')"
        type="boolean"
        :modelValue="store.config.AllowShortCaseLabelsOnASingleLine"
        @update:modelValue="store.setOption('AllowShortCaseLabelsOnASingleLine', $event as boolean)"
      />
      <OptionControl
        label="AllowShortLambdasOnASingleLine"
        :description="optionDescription('AllowShortLambdasOnASingleLine')"
        type="enum"
        :modelValue="store.config.AllowShortLambdasOnASingleLine"
        :enumValues="['None', 'Empty', 'Inline', 'All']"
        @update:modelValue="store.setOption('AllowShortLambdasOnASingleLine', $event as any)"
      />
      <OptionControl
        label="AllowShortEnumsOnASingleLine"
        :description="optionDescription('AllowShortEnumsOnASingleLine')"
        type="boolean"
        :modelValue="store.config.AllowShortEnumsOnASingleLine"
        @update:modelValue="store.setOption('AllowShortEnumsOnASingleLine', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.wrappingAndBraces.groups.breaking')">
      <OptionControl
        label="BreakBeforeBinaryOperators"
        :description="optionDescription('BreakBeforeBinaryOperators')"
        type="enum"
        :modelValue="store.config.BreakBeforeBinaryOperators"
        :enumValues="['None', 'NonAssignment', 'All']"
        @update:modelValue="store.setOption('BreakBeforeBinaryOperators', $event as any)"
      />
      <OptionControl
        label="BreakBeforeTernaryOperators"
        :description="optionDescription('BreakBeforeTernaryOperators')"
        type="boolean"
        :modelValue="store.config.BreakBeforeTernaryOperators"
        @update:modelValue="store.setOption('BreakBeforeTernaryOperators', $event as boolean)"
      />
      <OptionControl
        label="BreakConstructorInitializers"
        :description="optionDescription('BreakConstructorInitializers')"
        type="enum"
        :modelValue="store.config.BreakConstructorInitializers"
        :enumValues="['BeforeColon', 'BeforeComma', 'AfterColon', 'AfterComma']"
        @update:modelValue="store.setOption('BreakConstructorInitializers', $event as any)"
      />
      <OptionControl
        label="BreakInheritanceList"
        :description="optionDescription('BreakInheritanceList')"
        type="enum"
        :modelValue="store.config.BreakInheritanceList"
        :enumValues="['BeforeColon', 'BeforeComma', 'AfterColon', 'AfterComma']"
        @update:modelValue="store.setOption('BreakInheritanceList', $event as any)"
      />
      <OptionControl
        label="BreakTemplateDeclarations"
        :description="optionDescription('BreakTemplateDeclarations')"
        type="enum"
        :modelValue="store.config.BreakTemplateDeclarations"
        :enumValues="['Leave', 'No', 'MultiLine', 'Yes']"
        @update:modelValue="store.setOption('BreakTemplateDeclarations', $event as any)"
      />
      <OptionControl
        label="BreakStringLiterals"
        :description="optionDescription('BreakStringLiterals')"
        type="boolean"
        :modelValue="store.config.BreakStringLiterals"
        @update:modelValue="store.setOption('BreakStringLiterals', $event as boolean)"
      />
      <OptionControl
        label="BreakAfterReturnType"
        :description="optionDescription('BreakAfterReturnType')"
        type="enum"
        :modelValue="store.config.BreakAfterReturnType"
        :enumValues="['None', 'Automatic', 'ExceptShortType', 'All', 'TopLevel', 'AllDefinitions', 'TopLevelDefinitions']"
        @update:modelValue="store.setOption('BreakAfterReturnType', $event as any)"
      />
      <OptionControl
        label="AlwaysBreakBeforeMultilineStrings"
        :description="optionDescription('AlwaysBreakBeforeMultilineStrings')"
        type="boolean"
        :modelValue="store.config.AlwaysBreakBeforeMultilineStrings"
        @update:modelValue="store.setOption('AlwaysBreakBeforeMultilineStrings', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.wrappingAndBraces.groups.packing')">
      <OptionControl
        label="BinPackArguments"
        :description="optionDescription('BinPackArguments')"
        type="boolean"
        :modelValue="store.config.BinPackArguments"
        @update:modelValue="store.setOption('BinPackArguments', $event as boolean)"
      />
      <OptionControl
        label="BinPackParameters"
        :description="optionDescription('BinPackParameters')"
        type="enum"
        :modelValue="String(store.config.BinPackParameters)"
        :enumValues="['BinPack', 'OnePerLine', 'AlwaysOnePerLine', 'true', 'false']"
        @update:modelValue="store.setOption('BinPackParameters', $event === 'true' ? true : $event === 'false' ? false : $event as any)"
      />
      <OptionControl
        label="PackConstructorInitializers"
        :description="optionDescription('PackConstructorInitializers')"
        type="enum"
        :modelValue="store.config.PackConstructorInitializers"
        :enumValues="['Never', 'BinPack', 'CurrentLine', 'NextLine', 'NextLineOnly']"
        @update:modelValue="store.setOption('PackConstructorInitializers', $event as any)"
      />
      <OptionControl
        label="AllowAllArgumentsOnNextLine"
        :description="optionDescription('AllowAllArgumentsOnNextLine')"
        type="boolean"
        :modelValue="store.config.AllowAllArgumentsOnNextLine"
        @update:modelValue="store.setOption('AllowAllArgumentsOnNextLine', $event as boolean)"
      />
      <OptionControl
        label="AllowAllParametersOfDeclarationOnNextLine"
        :description="optionDescription('AllowAllParametersOfDeclarationOnNextLine')"
        type="boolean"
        :modelValue="store.config.AllowAllParametersOfDeclarationOnNextLine"
        @update:modelValue="store.setOption('AllowAllParametersOfDeclarationOnNextLine', $event as boolean)"
      />
      <OptionControl
        label="BreakFunctionDefinitionParameters"
        :description="optionDescription('BreakFunctionDefinitionParameters')"
        type="boolean"
        :modelValue="store.config.BreakFunctionDefinitionParameters"
        @update:modelValue="store.setOption('BreakFunctionDefinitionParameters', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.wrappingAndBraces.groups.namespaces')">
      <OptionControl
        label="CompactNamespaces"
        :description="optionDescription('CompactNamespaces')"
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
