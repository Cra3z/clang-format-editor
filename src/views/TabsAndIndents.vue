<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'

const store = useFormatStore()
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">缩进与制表符</h2>

    <OptionGroup label="制表符" description="配置制表符和缩进的基本行为">
      <OptionControl
        label="UseTab"
        description="使用制表符的方式"
        type="enum"
        :modelValue="store.config.UseTab"
        :enumValues="['Never', 'ForIndentation', 'ForContinuationAndIndentation', 'AlignWithSpaces', 'Always']"
        @update:modelValue="store.setOption('UseTab', $event as any)"
      />
      <OptionControl
        label="IndentWidth"
        description="缩进宽度（空格数）"
        type="integer"
        :modelValue="store.config.IndentWidth"
        :min="1" :max="16"
        @update:modelValue="store.setOption('IndentWidth', $event as number)"
      />
      <OptionControl
        label="TabWidth"
        description="制表符宽度"
        type="integer"
        :modelValue="store.config.TabWidth"
        :min="1" :max="16"
        @update:modelValue="store.setOption('TabWidth', $event as number)"
      />
      <OptionControl
        label="ContinuationIndentWidth"
        description="续行缩进宽度"
        type="integer"
        :modelValue="store.config.ContinuationIndentWidth"
        :min="0" :max="32"
        @update:modelValue="store.setOption('ContinuationIndentWidth', $event as number)"
      />
      <OptionControl
        label="ConstructorInitializerIndentWidth"
        description="构造函数初始化列表及继承列表的缩进宽度"
        type="integer"
        :modelValue="store.config.ConstructorInitializerIndentWidth"
        :min="0" :max="32"
        @update:modelValue="store.setOption('ConstructorInitializerIndentWidth', $event as number)"
      />
    </OptionGroup>

    <OptionGroup label="语句缩进" description="各类语句的缩进行为">
      <OptionControl
        label="IndentCaseLabels"
        description="case 标签缩进一级"
        type="boolean"
        :modelValue="store.config.IndentCaseLabels"
        @update:modelValue="store.setOption('IndentCaseLabels', $event as boolean)"
      />
      <OptionControl
        label="IndentCaseBlocks"
        description="case 块缩进一级"
        type="boolean"
        :modelValue="store.config.IndentCaseBlocks"
        @update:modelValue="store.setOption('IndentCaseBlocks', $event as boolean)"
      />
      <OptionControl
        label="IndentGotoLabels"
        description="goto 标签缩进方式"
        type="enum"
        :modelValue="store.config.IndentGotoLabels"
        :enumValues="['NoIndent', 'OuterIndent', 'InnerIndent', 'HalfIndent']"
        @update:modelValue="store.setOption('IndentGotoLabels', $event as any)"
      />
      <OptionControl
        label="IndentExportBlock"
        description="缩进 export {} 块体"
        type="boolean"
        :modelValue="store.config.IndentExportBlock"
        @update:modelValue="store.setOption('IndentExportBlock', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup label="访问修饰符与命名空间">
      <OptionControl
        label="IndentAccessModifiers"
        description="访问修饰符拥有独立缩进层级"
        type="boolean"
        :modelValue="store.config.IndentAccessModifiers"
        @update:modelValue="store.setOption('IndentAccessModifiers', $event as boolean)"
      />
      <OptionControl
        label="AccessModifierOffset"
        description="访问修饰符的额外缩进偏移量"
        type="integer"
        :modelValue="store.config.AccessModifierOffset"
        :min="-16" :max="16"
        @update:modelValue="store.setOption('AccessModifierOffset', $event as number)"
      />
      <OptionControl
        label="NamespaceIndentation"
        description="命名空间缩进方式"
        type="enum"
        :modelValue="store.config.NamespaceIndentation"
        :enumValues="['None', 'Inner', 'All']"
        @update:modelValue="store.setOption('NamespaceIndentation', $event as any)"
      />
      <OptionControl
        label="IndentExternBlock"
        description="extern 块缩进方式"
        type="enum"
        :modelValue="store.config.IndentExternBlock"
        :enumValues="['AfterExternBlock', 'NoIndent', 'Indent']"
        @update:modelValue="store.setOption('IndentExternBlock', $event as any)"
      />
    </OptionGroup>

    <OptionGroup label="预处理与其他">
      <OptionControl
        label="IndentPPDirectives"
        description="预处理指令缩进方式"
        type="enum"
        :modelValue="store.config.IndentPPDirectives"
        :enumValues="['None', 'AfterHash', 'BeforeHash', 'Leave']"
        @update:modelValue="store.setOption('IndentPPDirectives', $event as any)"
      />
      <OptionControl
        label="PPIndentWidth"
        description="预处理指令缩进宽度（-1 使用 IndentWidth）"
        type="integer"
        :modelValue="store.config.PPIndentWidth"
        :min="-1" :max="32"
        @update:modelValue="store.setOption('PPIndentWidth', $event as number)"
      />
      <OptionControl
        label="IndentWrappedFunctionNames"
        description="换行的函数名缩进"
        type="boolean"
        :modelValue="store.config.IndentWrappedFunctionNames"
        @update:modelValue="store.setOption('IndentWrappedFunctionNames', $event as boolean)"
      />
      <OptionControl
        label="IndentRequiresClause"
        description="requires 子句缩进"
        type="boolean"
        :modelValue="store.config.IndentRequiresClause"
        @update:modelValue="store.setOption('IndentRequiresClause', $event as boolean)"
      />
      <OptionControl
        label="LambdaBodyIndentation"
        description="Lambda 体缩进方式"
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
