<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'
import { useI18n } from 'vue-i18n'

const store = useFormatStore()
const { t } = useI18n()

function optionDescription(key: string) {
  return t(`views.alignment.options.${key}`)
}
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">{{ t('views.alignment.title') }}</h2>

    <OptionGroup :label="t('views.alignment.groups.brackets')">
      <OptionControl
        label="AlignAfterOpenBracket"
        :description="optionDescription('AlignAfterOpenBracket')"
        type="enum"
        :modelValue="store.config.AlignAfterOpenBracket"
        :enumValues="['Align', 'DontAlign', 'AlwaysBreak', 'BlockIndent']"
        @update:modelValue="store.setOption('AlignAfterOpenBracket', $event as any)"
      />
      <OptionControl
        label="AlignArrayOfStructures"
        :description="optionDescription('AlignArrayOfStructures')"
        type="enum"
        :modelValue="store.config.AlignArrayOfStructures"
        :enumValues="['Left', 'Right', 'None']"
        @update:modelValue="store.setOption('AlignArrayOfStructures', $event as any)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.alignment.groups.consecutive')">
      <OptionControl
        label="AlignConsecutiveAssignments"
        :description="optionDescription('AlignConsecutiveAssignments')"
        type="enum"
        :modelValue="store.config.AlignConsecutiveAssignments"
        :enumValues="['None', 'Consecutive', 'AcrossEmptyLines', 'AcrossComments', 'AcrossEmptyLinesAndComments']"
        @update:modelValue="store.setOption('AlignConsecutiveAssignments', $event as any)"
      />
      <OptionControl
        label="AlignConsecutiveBitFields"
        :description="optionDescription('AlignConsecutiveBitFields')"
        type="enum"
        :modelValue="store.config.AlignConsecutiveBitFields"
        :enumValues="['None', 'Consecutive', 'AcrossEmptyLines', 'AcrossComments', 'AcrossEmptyLinesAndComments']"
        @update:modelValue="store.setOption('AlignConsecutiveBitFields', $event as any)"
      />
      <OptionControl
        label="AlignConsecutiveDeclarations"
        :description="optionDescription('AlignConsecutiveDeclarations')"
        type="enum"
        :modelValue="store.config.AlignConsecutiveDeclarations"
        :enumValues="['None', 'Consecutive', 'AcrossEmptyLines', 'AcrossComments', 'AcrossEmptyLinesAndComments']"
        @update:modelValue="store.setOption('AlignConsecutiveDeclarations', $event as any)"
      />
      <OptionControl
        label="AlignConsecutiveMacros"
        :description="optionDescription('AlignConsecutiveMacros')"
        type="enum"
        :modelValue="store.config.AlignConsecutiveMacros"
        :enumValues="['None', 'Consecutive', 'AcrossEmptyLines', 'AcrossComments', 'AcrossEmptyLinesAndComments']"
        @update:modelValue="store.setOption('AlignConsecutiveMacros', $event as any)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.alignment.groups.misc')">
      <OptionControl
        label="AlignEscapedNewlines"
        :description="optionDescription('AlignEscapedNewlines')"
        type="enum"
        :modelValue="store.config.AlignEscapedNewlines"
        :enumValues="['DontAlign', 'Left', 'Right']"
        @update:modelValue="store.setOption('AlignEscapedNewlines', $event as any)"
      />
      <OptionControl
        label="AlignOperands"
        :description="optionDescription('AlignOperands')"
        type="enum"
        :modelValue="store.config.AlignOperands"
        :enumValues="['DontAlign', 'Align', 'AlignAfterOperator']"
        @update:modelValue="store.setOption('AlignOperands', $event as any)"
      />
      <OptionControl
        label="AlignTrailingComments"
        :description="optionDescription('AlignTrailingComments')"
        type="boolean"
        :modelValue="store.config.AlignTrailingComments"
        @update:modelValue="store.setOption('AlignTrailingComments', $event as boolean)"
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
