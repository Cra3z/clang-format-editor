<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'

const store = useFormatStore()
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">空行</h2>

    <OptionGroup label="保留空行">
      <OptionControl
        label="MaxEmptyLinesToKeep"
        description="最大保留的连续空行数"
        type="integer"
        :modelValue="store.config.MaxEmptyLinesToKeep"
        :min="0" :max="10"
        @update:modelValue="store.setOption('MaxEmptyLinesToKeep', $event as number)"
      />
    </OptionGroup>

    <OptionGroup label="访问修饰符空行">
      <OptionControl
        label="EmptyLineAfterAccessModifier"
        description="访问修饰符后的空行"
        type="enum"
        :modelValue="store.config.EmptyLineAfterAccessModifier"
        :enumValues="['Never', 'Leave', 'Always']"
        @update:modelValue="store.setOption('EmptyLineAfterAccessModifier', $event as any)"
      />
      <OptionControl
        label="EmptyLineBeforeAccessModifier"
        description="访问修饰符前的空行"
        type="enum"
        :modelValue="store.config.EmptyLineBeforeAccessModifier"
        :enumValues="['Never', 'Leave', 'LogicalBlock', 'Always']"
        @update:modelValue="store.setOption('EmptyLineBeforeAccessModifier', $event as any)"
      />
    </OptionGroup>

    <OptionGroup label="定义块间空行">
      <OptionControl
        label="SeparateDefinitionBlocks"
        description="使用空行分隔定义块（类、函数、枚举等）"
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
