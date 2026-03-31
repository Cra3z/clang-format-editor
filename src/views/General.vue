<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'
import { useI18n } from 'vue-i18n'

const store = useFormatStore()
const { t } = useI18n()

function optionDescription(key: string) {
  return t(`views.general.options.${key}`)
}
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">{{ t('views.general.title') }}</h2>

    <OptionGroup :label="t('views.general.groups.base')">
      <OptionControl
        label="BasedOnStyle"
        :description="optionDescription('BasedOnStyle')"
        type="enum"
        :modelValue="store.config.BasedOnStyle"
        :enumValues="['LLVM', 'Google', 'Chromium', 'Mozilla', 'WebKit', 'Microsoft', 'GNU', 'InheritParentConfig']"
        @update:modelValue="store.setOption('BasedOnStyle', $event as any)"
      />
      <OptionControl
        label="Language"
        :description="optionDescription('Language')"
        type="enum"
        :modelValue="store.config.Language"
        :enumValues="['None', 'C', 'Cpp', 'CSharp', 'Java', 'JavaScript', 'Json', 'ObjC', 'Proto', 'TableGen', 'TextProto', 'Verilog']"
        @update:modelValue="store.setOption('Language', $event as any)"
      />
      <OptionControl
        label="Standard"
        :description="optionDescription('Standard')"
        type="enum"
        :modelValue="store.config.Standard"
        :enumValues="['c++03', 'c++11', 'c++14', 'c++17', 'c++20', 'Latest', 'Auto']"
        @update:modelValue="store.setOption('Standard', $event as any)"
      />
      <OptionControl
        label="ColumnLimit"
        :description="optionDescription('ColumnLimit')"
        type="integer"
        :modelValue="store.config.ColumnLimit"
        :min="0"
        :max="300"
        @update:modelValue="store.setOption('ColumnLimit', $event as number)"
      />
      <OptionControl
        label="LineEnding"
        :description="optionDescription('LineEnding')"
        type="enum"
        :modelValue="store.config.LineEnding ?? 'DeriveLF'"
        :enumValues="['LF', 'CRLF', 'DeriveLF', 'DeriveCRLF']"
        @update:modelValue="store.setOption('LineEnding', $event as any)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.general.groups.automation')">
      <OptionControl
        label="DerivePointerAlignment"
        :description="optionDescription('DerivePointerAlignment')"
        type="boolean"
        :modelValue="store.config.DerivePointerAlignment"
        @update:modelValue="store.setOption('DerivePointerAlignment', $event as boolean)"
      />
      <OptionControl
        label="DisableFormat"
        :description="optionDescription('DisableFormat')"
        type="boolean"
        :modelValue="store.config.DisableFormat"
        @update:modelValue="store.setOption('DisableFormat', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.general.groups.commentsIncludes')">
      <OptionControl
        label="FixNamespaceComments"
        :description="optionDescription('FixNamespaceComments')"
        type="boolean"
        :modelValue="store.config.FixNamespaceComments"
        @update:modelValue="store.setOption('FixNamespaceComments', $event as boolean)"
      />
      <OptionControl
        label="SortIncludes"
        :description="optionDescription('SortIncludes')"
        type="enum"
        :modelValue="store.config.SortIncludes"
        :enumValues="['Never', 'CaseSensitive', 'CaseInsensitive']"
        @update:modelValue="store.setOption('SortIncludes', $event as any)"
      />
      <OptionControl
        label="IncludeBlocks"
        :description="optionDescription('IncludeBlocks')"
        type="enum"
        :modelValue="store.config.IncludeBlocks"
        :enumValues="['Preserve', 'Merge', 'Regroup']"
        @update:modelValue="store.setOption('IncludeBlocks', $event as any)"
      />
      <OptionControl
        label="SortUsingDeclarations"
        :description="optionDescription('SortUsingDeclarations')"
        type="enum"
        :modelValue="store.config.SortUsingDeclarations"
        :enumValues="['Never', 'Lexicographic', 'LexicographicNumeric']"
        @update:modelValue="store.setOption('SortUsingDeclarations', $event as any)"
      />
      <OptionControl
        label="ReflowComments"
        :description="optionDescription('ReflowComments')"
        type="enum"
        :modelValue="String(store.config.ReflowComments)"
        :enumValues="['Never', 'IndentOnly', 'Always', 'true', 'false']"
        @update:modelValue="store.setOption('ReflowComments', $event === 'true' ? true : $event === 'false' ? false : $event as any)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.general.groups.codeChanges')">
      <OptionControl
        label="InsertBraces"
        :description="optionDescription('InsertBraces')"
        type="boolean"
        :modelValue="store.config.InsertBraces"
        @update:modelValue="store.setOption('InsertBraces', $event as boolean)"
      />
      <OptionControl
        label="InsertNewlineAtEOF"
        :description="optionDescription('InsertNewlineAtEOF')"
        type="boolean"
        :modelValue="store.config.InsertNewlineAtEOF"
        @update:modelValue="store.setOption('InsertNewlineAtEOF', $event as boolean)"
      />
      <OptionControl
        label="RemoveBracesLLVM"
        :description="optionDescription('RemoveBracesLLVM')"
        type="boolean"
        :modelValue="store.config.RemoveBracesLLVM"
        @update:modelValue="store.setOption('RemoveBracesLLVM', $event as boolean)"
      />
      <OptionControl
        label="RemoveSemicolon"
        :description="optionDescription('RemoveSemicolon')"
        type="boolean"
        :modelValue="store.config.RemoveSemicolon"
        @update:modelValue="store.setOption('RemoveSemicolon', $event as boolean)"
      />
      <OptionControl
        label="QualifierAlignment"
        :description="optionDescription('QualifierAlignment')"
        type="enum"
        :modelValue="store.config.QualifierAlignment"
        :enumValues="['Leave', 'Left', 'Right', 'Custom']"
        @update:modelValue="store.setOption('QualifierAlignment', $event as any)"
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
