<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'
import { useI18n } from 'vue-i18n'

const store = useFormatStore()
const { t } = useI18n()

function optionDescription(key: string) {
  return t(`views.tabsAndIndents.options.${key}`)
}
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">{{ t('views.tabsAndIndents.title') }}</h2>

    <OptionGroup :label="t('views.tabsAndIndents.groups.tabs.title')" :description="t('views.tabsAndIndents.groups.tabs.description')">
      <OptionControl
        label="UseTab"
        :description="optionDescription('UseTab')"
        type="enum"
        :modelValue="store.config.UseTab"
        :enumValues="['Never', 'ForIndentation', 'ForContinuationAndIndentation', 'AlignWithSpaces', 'Always']"
        @update:modelValue="store.setOption('UseTab', $event as any)"
      />
      <OptionControl
        label="IndentWidth"
        :description="optionDescription('IndentWidth')"
        type="integer"
        :modelValue="store.config.IndentWidth"
        :min="1" :max="16"
        @update:modelValue="store.setOption('IndentWidth', $event as number)"
      />
      <OptionControl
        label="TabWidth"
        :description="optionDescription('TabWidth')"
        type="integer"
        :modelValue="store.config.TabWidth"
        :min="1" :max="16"
        @update:modelValue="store.setOption('TabWidth', $event as number)"
      />
      <OptionControl
        label="ContinuationIndentWidth"
        :description="optionDescription('ContinuationIndentWidth')"
        type="integer"
        :modelValue="store.config.ContinuationIndentWidth"
        :min="0" :max="32"
        @update:modelValue="store.setOption('ContinuationIndentWidth', $event as number)"
      />
      <OptionControl
        label="ConstructorInitializerIndentWidth"
        :description="optionDescription('ConstructorInitializerIndentWidth')"
        type="integer"
        :modelValue="store.config.ConstructorInitializerIndentWidth"
        :min="0" :max="32"
        @update:modelValue="store.setOption('ConstructorInitializerIndentWidth', $event as number)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.tabsAndIndents.groups.statements.title')" :description="t('views.tabsAndIndents.groups.statements.description')">
      <OptionControl
        label="IndentCaseLabels"
        :description="optionDescription('IndentCaseLabels')"
        type="boolean"
        :modelValue="store.config.IndentCaseLabels"
        @update:modelValue="store.setOption('IndentCaseLabels', $event as boolean)"
      />
      <OptionControl
        label="IndentCaseBlocks"
        :description="optionDescription('IndentCaseBlocks')"
        type="boolean"
        :modelValue="store.config.IndentCaseBlocks"
        @update:modelValue="store.setOption('IndentCaseBlocks', $event as boolean)"
      />
      <OptionControl
        label="IndentGotoLabels"
        :description="optionDescription('IndentGotoLabels')"
        type="enum"
        :modelValue="store.config.IndentGotoLabels"
        :enumValues="['NoIndent', 'OuterIndent', 'InnerIndent', 'HalfIndent']"
        @update:modelValue="store.setOption('IndentGotoLabels', $event as any)"
      />
      <OptionControl
        label="IndentExportBlock"
        :description="optionDescription('IndentExportBlock')"
        type="boolean"
        :modelValue="store.config.IndentExportBlock"
        @update:modelValue="store.setOption('IndentExportBlock', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.tabsAndIndents.groups.access.title')">
      <OptionControl
        label="IndentAccessModifiers"
        :description="optionDescription('IndentAccessModifiers')"
        type="boolean"
        :modelValue="store.config.IndentAccessModifiers"
        @update:modelValue="store.setOption('IndentAccessModifiers', $event as boolean)"
      />
      <OptionControl
        label="AccessModifierOffset"
        :description="optionDescription('AccessModifierOffset')"
        type="integer"
        :modelValue="store.config.AccessModifierOffset"
        :min="-16" :max="16"
        @update:modelValue="store.setOption('AccessModifierOffset', $event as number)"
      />
      <OptionControl
        label="NamespaceIndentation"
        :description="optionDescription('NamespaceIndentation')"
        type="enum"
        :modelValue="store.config.NamespaceIndentation"
        :enumValues="['None', 'Inner', 'All']"
        @update:modelValue="store.setOption('NamespaceIndentation', $event as any)"
      />
      <OptionControl
        label="IndentExternBlock"
        :description="optionDescription('IndentExternBlock')"
        type="enum"
        :modelValue="store.config.IndentExternBlock"
        :enumValues="['AfterExternBlock', 'NoIndent', 'Indent']"
        @update:modelValue="store.setOption('IndentExternBlock', $event as any)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.tabsAndIndents.groups.preprocessor.title')">
      <OptionControl
        label="IndentPPDirectives"
        :description="optionDescription('IndentPPDirectives')"
        type="enum"
        :modelValue="store.config.IndentPPDirectives"
        :enumValues="['None', 'AfterHash', 'BeforeHash', 'Leave']"
        @update:modelValue="store.setOption('IndentPPDirectives', $event as any)"
      />
      <OptionControl
        label="PPIndentWidth"
        :description="optionDescription('PPIndentWidth')"
        type="integer"
        :modelValue="store.config.PPIndentWidth"
        :min="-1" :max="32"
        @update:modelValue="store.setOption('PPIndentWidth', $event as number)"
      />
      <OptionControl
        label="IndentWrappedFunctionNames"
        :description="optionDescription('IndentWrappedFunctionNames')"
        type="boolean"
        :modelValue="store.config.IndentWrappedFunctionNames"
        @update:modelValue="store.setOption('IndentWrappedFunctionNames', $event as boolean)"
      />
      <OptionControl
        label="IndentRequiresClause"
        :description="optionDescription('IndentRequiresClause')"
        type="boolean"
        :modelValue="store.config.IndentRequiresClause"
        @update:modelValue="store.setOption('IndentRequiresClause', $event as boolean)"
      />
      <OptionControl
        label="LambdaBodyIndentation"
        :description="optionDescription('LambdaBodyIndentation')"
        type="enum"
        :modelValue="store.config.LambdaBodyIndentation"
        :enumValues="['Signature', 'OuterScope']"
        @update:modelValue="store.setOption('LambdaBodyIndentation', $event as any)"
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
