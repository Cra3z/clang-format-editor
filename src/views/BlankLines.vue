<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'
import { useI18n } from 'vue-i18n'

const store = useFormatStore()
const { t } = useI18n()

function optionDescription(key: string) {
  return t(`views.blankLines.options.${key}`)
}
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">{{ t('views.blankLines.title') }}</h2>

    <OptionGroup :label="t('views.blankLines.groups.keep')">
      <OptionControl
        label="MaxEmptyLinesToKeep"
        :description="optionDescription('MaxEmptyLinesToKeep')"
        type="integer"
        :modelValue="store.config.MaxEmptyLinesToKeep"
        :min="0" :max="10"
        @update:modelValue="store.setOption('MaxEmptyLinesToKeep', $event as number)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.blankLines.groups.access')">
      <OptionControl
        label="EmptyLineAfterAccessModifier"
        :description="optionDescription('EmptyLineAfterAccessModifier')"
        type="enum"
        :modelValue="store.config.EmptyLineAfterAccessModifier"
        :enumValues="['Never', 'Leave', 'Always']"
        @update:modelValue="store.setOption('EmptyLineAfterAccessModifier', $event as any)"
      />
      <OptionControl
        label="EmptyLineBeforeAccessModifier"
        :description="optionDescription('EmptyLineBeforeAccessModifier')"
        type="enum"
        :modelValue="store.config.EmptyLineBeforeAccessModifier"
        :enumValues="['Never', 'Leave', 'LogicalBlock', 'Always']"
        @update:modelValue="store.setOption('EmptyLineBeforeAccessModifier', $event as any)"
      />
    </OptionGroup>

    <OptionGroup :label="t('views.blankLines.groups.definitions')">
      <OptionControl
        label="SeparateDefinitionBlocks"
        :description="optionDescription('SeparateDefinitionBlocks')"
        type="enum"
        :modelValue="store.config.SeparateDefinitionBlocks"
        :enumValues="['Leave', 'Always', 'Never']"
        @update:modelValue="store.setOption('SeparateDefinitionBlocks', $event as any)"
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
