<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'

const store = useFormatStore()
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">空格</h2>

    <OptionGroup label="类型转换与运算符">
      <OptionControl
        label="SpaceAfterCStyleCast"
        description="C 风格类型转换后添加空格"
        type="boolean"
        :modelValue="store.config.SpaceAfterCStyleCast"
        @update:modelValue="store.setOption('SpaceAfterCStyleCast', $event as boolean)"
      />
      <OptionControl
        label="SpaceAfterLogicalNot"
        description="逻辑非 (!) 后添加空格"
        type="boolean"
        :modelValue="store.config.SpaceAfterLogicalNot"
        @update:modelValue="store.setOption('SpaceAfterLogicalNot', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeAssignmentOperators"
        description="赋值运算符前添加空格"
        type="boolean"
        :modelValue="store.config.SpaceBeforeAssignmentOperators"
        @update:modelValue="store.setOption('SpaceBeforeAssignmentOperators', $event as boolean)"
      />
      <OptionControl
        label="SpaceAfterOperatorKeyword"
        description="operator 关键字后添加空格"
        type="boolean"
        :modelValue="store.config.SpaceAfterOperatorKeyword"
        @update:modelValue="store.setOption('SpaceAfterOperatorKeyword', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup label="模板与括号">
      <OptionControl
        label="SpaceAfterTemplateKeyword"
        description="template 关键字后添加空格"
        type="boolean"
        :modelValue="store.config.SpaceAfterTemplateKeyword"
        @update:modelValue="store.setOption('SpaceAfterTemplateKeyword', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeParens"
        description="括号前空格策略"
        type="enum"
        :modelValue="store.config.SpaceBeforeParens"
        :enumValues="['Never', 'ControlStatements', 'ControlStatementsExceptControlMacros', 'NonEmptyParentheses', 'Always', 'Custom']"
        @update:modelValue="store.setOption('SpaceBeforeParens', $event as any)"
      />
      <OptionControl
        label="SpacesInAngles"
        description="尖括号内空格"
        type="enum"
        :modelValue="store.config.SpacesInAngles"
        :enumValues="['Never', 'Always', 'Leave']"
        @update:modelValue="store.setOption('SpacesInAngles', $event as any)"
      />
      <OptionControl
        label="SpacesInParens"
        description="圆括号内空格"
        type="enum"
        :modelValue="store.config.SpacesInParens"
        :enumValues="['Never', 'Custom']"
        @update:modelValue="store.setOption('SpacesInParens', $event as any)"
      />
      <OptionControl
        label="SpacesInSquareBrackets"
        description="方括号内添加空格"
        type="boolean"
        :modelValue="store.config.SpacesInSquareBrackets"
        @update:modelValue="store.setOption('SpacesInSquareBrackets', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeSquareBrackets"
        description="方括号前添加空格"
        type="boolean"
        :modelValue="store.config.SpaceBeforeSquareBrackets"
        @update:modelValue="store.setOption('SpaceBeforeSquareBrackets', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup label="冒号空格">
      <OptionControl
        label="SpaceBeforeCaseColon"
        description="case 冒号前添加空格"
        type="boolean"
        :modelValue="store.config.SpaceBeforeCaseColon"
        @update:modelValue="store.setOption('SpaceBeforeCaseColon', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeCtorInitializerColon"
        description="构造函数初始化列表冒号前空格"
        type="boolean"
        :modelValue="store.config.SpaceBeforeCtorInitializerColon"
        @update:modelValue="store.setOption('SpaceBeforeCtorInitializerColon', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeInheritanceColon"
        description="继承列表冒号前空格"
        type="boolean"
        :modelValue="store.config.SpaceBeforeInheritanceColon"
        @update:modelValue="store.setOption('SpaceBeforeInheritanceColon', $event as boolean)"
      />
      <OptionControl
        label="SpaceBeforeRangeBasedForLoopColon"
        description="范围 for 循环冒号前空格"
        type="boolean"
        :modelValue="store.config.SpaceBeforeRangeBasedForLoopColon"
        @update:modelValue="store.setOption('SpaceBeforeRangeBasedForLoopColon', $event as boolean)"
      />
      <OptionControl
        label="BitFieldColonSpacing"
        description="位域冒号空格方式"
        type="enum"
        :modelValue="store.config.BitFieldColonSpacing"
        :enumValues="['Both', 'None', 'Before', 'After']"
        @update:modelValue="store.setOption('BitFieldColonSpacing', $event as any)"
      />
    </OptionGroup>

    <OptionGroup label="指针与引用">
      <OptionControl
        label="PointerAlignment"
        description="指针对齐方式"
        type="enum"
        :modelValue="store.config.PointerAlignment"
        :enumValues="['Left', 'Right', 'Middle']"
        @update:modelValue="store.setOption('PointerAlignment', $event as any)"
      />
      <OptionControl
        label="ReferenceAlignment"
        description="引用对齐方式"
        type="enum"
        :modelValue="store.config.ReferenceAlignment"
        :enumValues="['Pointer', 'Left', 'Right', 'Middle']"
        @update:modelValue="store.setOption('ReferenceAlignment', $event as any)"
      />
      <OptionControl
        label="SpaceAroundPointerQualifiers"
        description="指针限定符周围空格"
        type="enum"
        :modelValue="store.config.SpaceAroundPointerQualifiers"
        :enumValues="['Default', 'Before', 'After', 'Both']"
        @update:modelValue="store.setOption('SpaceAroundPointerQualifiers', $event as any)"
      />
    </OptionGroup>

    <OptionGroup label="其他">
      <OptionControl
        label="SpaceBeforeCpp11BracedList"
        description="C++11 花括号列表前空格"
        type="boolean"
        :modelValue="store.config.SpaceBeforeCpp11BracedList"
        @update:modelValue="store.setOption('SpaceBeforeCpp11BracedList', $event as boolean)"
      />
      <OptionControl
        label="SpacesBeforeTrailingComments"
        description="尾随注释前的空格数"
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
