<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'

const store = useFormatStore()
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">对齐</h2>

    <OptionGroup label="括号对齐">
      <OptionControl
        label="AlignAfterOpenBracket"
        description="左括号后的对齐方式"
        type="enum"
        :modelValue="store.config.AlignAfterOpenBracket"
        :enumValues="['Align', 'DontAlign', 'AlwaysBreak', 'BlockIndent']"
        @update:modelValue="store.setOption('AlignAfterOpenBracket', $event as any)"
      />
      <OptionControl
        label="AlignArrayOfStructures"
        description="对齐结构体数组的列"
        type="enum"
        :modelValue="store.config.AlignArrayOfStructures"
        :enumValues="['Left', 'Right', 'None']"
        @update:modelValue="store.setOption('AlignArrayOfStructures', $event as any)"
      />
    </OptionGroup>

    <OptionGroup label="连续赋值 / 声明对齐">
      <OptionControl
        label="AlignConsecutiveAssignments"
        description="对齐连续的赋值语句"
        type="enum"
        :modelValue="store.config.AlignConsecutiveAssignments"
        :enumValues="['None', 'Consecutive', 'AcrossEmptyLines', 'AcrossComments', 'AcrossEmptyLinesAndComments']"
        @update:modelValue="store.setOption('AlignConsecutiveAssignments', $event as any)"
      />
      <OptionControl
        label="AlignConsecutiveBitFields"
        description="对齐连续的位域定义"
        type="enum"
        :modelValue="store.config.AlignConsecutiveBitFields"
        :enumValues="['None', 'Consecutive', 'AcrossEmptyLines', 'AcrossComments', 'AcrossEmptyLinesAndComments']"
        @update:modelValue="store.setOption('AlignConsecutiveBitFields', $event as any)"
      />
      <OptionControl
        label="AlignConsecutiveDeclarations"
        description="对齐连续的变量声明"
        type="enum"
        :modelValue="store.config.AlignConsecutiveDeclarations"
        :enumValues="['None', 'Consecutive', 'AcrossEmptyLines', 'AcrossComments', 'AcrossEmptyLinesAndComments']"
        @update:modelValue="store.setOption('AlignConsecutiveDeclarations', $event as any)"
      />
      <OptionControl
        label="AlignConsecutiveMacros"
        description="对齐连续的宏定义"
        type="enum"
        :modelValue="store.config.AlignConsecutiveMacros"
        :enumValues="['None', 'Consecutive', 'AcrossEmptyLines', 'AcrossComments', 'AcrossEmptyLinesAndComments']"
        @update:modelValue="store.setOption('AlignConsecutiveMacros', $event as any)"
      />
    </OptionGroup>

    <OptionGroup label="转义换行 / 操作符 / 注释对齐">
      <OptionControl
        label="AlignEscapedNewlines"
        description="转义换行符的对齐方式"
        type="enum"
        :modelValue="store.config.AlignEscapedNewlines"
        :enumValues="['DontAlign', 'Left', 'Right']"
        @update:modelValue="store.setOption('AlignEscapedNewlines', $event as any)"
      />
      <OptionControl
        label="AlignOperands"
        description="操作数的对齐方式"
        type="enum"
        :modelValue="store.config.AlignOperands"
        :enumValues="['DontAlign', 'Align', 'AlignAfterOperator']"
        @update:modelValue="store.setOption('AlignOperands', $event as any)"
      />
      <OptionControl
        label="AlignTrailingComments"
        description="对齐行尾注释"
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
