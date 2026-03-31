<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'
import { useI18n } from 'vue-i18n'

const store = useFormatStore()
const { t } = useI18n()

function optionDescription(key: string) {
  return t(`views.spaces.options.${key}`)
}
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">{{ t('views.spaces.title') }}</h2>

    <OptionGroup :label="t('views.spaces.groups.casts')">
      <OptionControl
        label="SpaceAfterCStyleCast"
        :description="optionDescription('SpaceAfterCStyleCast')"
        type="boolean"
        :modelValue="store.config.SpaceAfterCStyleCast"
        @update:modelValue="store.setOption('SpaceAfterCStyleCast', $event as boolean)"
      />
      <OptionControl
        label="SpaceAfterLogicalNot"
        :description="optionDescription('SpaceAfterLogicalNot')"
        type="boolean"
        :modelValue="store.config.SpaceAfterLogicalNot"
        @update:modelValue="store.setOption('SpaceAfterLogicalNot', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeAssignmentOperators"
        :description="optionDescription('SpaceBeforeAssignmentOperators')"
        type="boolean"
        :modelValue="store.config.SpaceBeforeAssignmentOperators"
        @update:modelValue="store.setOption('SpaceBeforeAssignmentOperators', $event as boolean)"
      />
      <OptionControl
        label="SpaceAfterOperatorKeyword"
        :description="optionDescription('SpaceAfterOperatorKeyword')"
        type="boolean"
        :modelValue="store.config.SpaceAfterOperatorKeyword"
        @update:modelValue="store.setOption('SpaceAfterOperatorKeyword', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.spaces.groups.templates')">
      <OptionControl
        label="SpaceAfterTemplateKeyword"
        :description="optionDescription('SpaceAfterTemplateKeyword')"
        type="boolean"
        :modelValue="store.config.SpaceAfterTemplateKeyword"
        @update:modelValue="store.setOption('SpaceAfterTemplateKeyword', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeParens"
        :description="optionDescription('SpaceBeforeParens')"
        type="enum"
        :modelValue="store.config.SpaceBeforeParens"
        :enumValues="['Never', 'ControlStatements', 'ControlStatementsExceptControlMacros', 'NonEmptyParentheses', 'Always', 'Custom']"
        @update:modelValue="store.setOption('SpaceBeforeParens', $event as any)"
      />
      <OptionControl
        label="SpacesInAngles"
        :description="optionDescription('SpacesInAngles')"
        type="enum"
        :modelValue="store.config.SpacesInAngles"
        :enumValues="['Never', 'Always', 'Leave']"
        @update:modelValue="store.setOption('SpacesInAngles', $event as any)"
      />
      <OptionControl
        label="SpacesInParens"
        :description="optionDescription('SpacesInParens')"
        type="enum"
        :modelValue="store.config.SpacesInParens"
        :enumValues="['Never', 'Custom']"
        @update:modelValue="store.setOption('SpacesInParens', $event as any)"
      />
      <OptionControl
        label="SpacesInSquareBrackets"
        :description="optionDescription('SpacesInSquareBrackets')"
        type="boolean"
        :modelValue="store.config.SpacesInSquareBrackets"
        @update:modelValue="store.setOption('SpacesInSquareBrackets', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeSquareBrackets"
        :description="optionDescription('SpaceBeforeSquareBrackets')"
        type="boolean"
        :modelValue="store.config.SpaceBeforeSquareBrackets"
        @update:modelValue="store.setOption('SpaceBeforeSquareBrackets', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.spaces.groups.colons')">
      <OptionControl
        label="SpaceBeforeCaseColon"
        :description="optionDescription('SpaceBeforeCaseColon')"
        type="boolean"
        :modelValue="store.config.SpaceBeforeCaseColon"
        @update:modelValue="store.setOption('SpaceBeforeCaseColon', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeCtorInitializerColon"
        :description="optionDescription('SpaceBeforeCtorInitializerColon')"
        type="boolean"
        :modelValue="store.config.SpaceBeforeCtorInitializerColon"
        @update:modelValue="store.setOption('SpaceBeforeCtorInitializerColon', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeInheritanceColon"
        :description="optionDescription('SpaceBeforeInheritanceColon')"
        type="boolean"
        :modelValue="store.config.SpaceBeforeInheritanceColon"
        @update:modelValue="store.setOption('SpaceBeforeInheritanceColon', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeRangeBasedForLoopColon"
        :description="optionDescription('SpaceBeforeRangeBasedForLoopColon')"
        type="boolean"
        :modelValue="store.config.SpaceBeforeRangeBasedForLoopColon"
        @update:modelValue="store.setOption('SpaceBeforeRangeBasedForLoopColon', $event as boolean)"
      />
      <OptionControl
        label="BitFieldColonSpacing"
        :description="optionDescription('BitFieldColonSpacing')"
        type="enum"
        :modelValue="store.config.BitFieldColonSpacing"
        :enumValues="['Both', 'None', 'Before', 'After']"
        @update:modelValue="store.setOption('BitFieldColonSpacing', $event as any)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.spaces.groups.pointers')">
      <OptionControl
        label="PointerAlignment"
        :description="optionDescription('PointerAlignment')"
        type="enum"
        :modelValue="store.config.PointerAlignment"
        :enumValues="['Left', 'Right', 'Middle']"
        @update:modelValue="store.setOption('PointerAlignment', $event as any)"
      />
      <OptionControl
        label="ReferenceAlignment"
        :description="optionDescription('ReferenceAlignment')"
        type="enum"
        :modelValue="store.config.ReferenceAlignment"
        :enumValues="['Pointer', 'Left', 'Right', 'Middle']"
        @update:modelValue="store.setOption('ReferenceAlignment', $event as any)"
      />
      <OptionControl
        label="SpaceAroundPointerQualifiers"
        :description="optionDescription('SpaceAroundPointerQualifiers')"
        type="enum"
        :modelValue="store.config.SpaceAroundPointerQualifiers"
        :enumValues="['Default', 'Before', 'After', 'Both']"
        @update:modelValue="store.setOption('SpaceAroundPointerQualifiers', $event as any)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.spaces.groups.other')">
      <OptionControl
        label="SpaceBeforeCpp11BracedList"
        :description="optionDescription('SpaceBeforeCpp11BracedList')"
        type="boolean"
        :modelValue="store.config.SpaceBeforeCpp11BracedList"
        @update:modelValue="store.setOption('SpaceBeforeCpp11BracedList', $event as boolean)"
      />
      <OptionControl
        label="SpacesBeforeTrailingComments"
        :description="optionDescription('SpacesBeforeTrailingComments')"
        type="integer"
        :modelValue="store.config.SpacesBeforeTrailingComments"
        :min="0" :max="16"
        @update:modelValue="store.setOption('SpacesBeforeTrailingComments', $event as number)"
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
