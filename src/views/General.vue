<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import OptionGroup from '@/components/OptionGroup.vue'
import OptionControl from '@/components/OptionControl.vue'

const store = useFormatStore()
</script>

<template>
  <div class="view-page">
    <h2 class="page-title">通用设置</h2>

    <OptionGroup label="基础配置">
      <OptionControl
        label="BasedOnStyle"
        description="基础风格预设"
        type="enum"
        :modelValue="store.config.BasedOnStyle"
        :enumValues="['LLVM', 'Google', 'Chromium', 'Mozilla', 'WebKit', 'Microsoft', 'GNU']"
        @update:modelValue="store.setOption('BasedOnStyle', $event as any)"
      />
      <OptionControl
        label="Language"
        description="目标语言"
        type="enum"
        :modelValue="store.config.Language"
        :enumValues="['None', 'C', 'Cpp', 'CSharp', 'Java', 'JavaScript', 'Json', 'ObjC', 'Proto', 'TableGen', 'TextProto', 'Verilog']"
        @update:modelValue="store.setOption('Language', $event as any)"
      />
      <OptionControl
        label="Standard"
        description="C++ 标准版本"
        type="enum"
        :modelValue="store.config.Standard"
        :enumValues="['c++03', 'c++11', 'c++14', 'c++17', 'c++20', 'Latest', 'Auto']"
        @update:modelValue="store.setOption('Standard', $event as any)"
      />
      <OptionControl
        label="ColumnLimit"
        description="列宽限制（0 表示无限制）"
        type="integer"
        :modelValue="store.config.ColumnLimit"
        :min="0"
        :max="300"
        @update:modelValue="store.setOption('ColumnLimit', $event as number)"
      />
      <OptionControl
        label="LineEnding"
        description="行尾风格"
        type="enum"
        :modelValue="store.config.LineEnding ?? 'DeriveLF'"
        :enumValues="['LF', 'CRLF', 'DeriveLF', 'DeriveCRLF']"
        @update:modelValue="store.setOption('LineEnding', $event as any)"
      />
    </OptionGroup>

    <OptionGroup label="自动功能">
      <OptionControl
        label="DerivePointerAlignment"
        description="从文件自动推导指针对齐方式"
        type="boolean"
        :modelValue="store.config.DerivePointerAlignment"
        @update:modelValue="store.setOption('DerivePointerAlignment', $event as boolean)"
      />
      <OptionControl
        label="DisableFormat"
        description="完全禁用格式化"
        type="boolean"
        :modelValue="store.config.DisableFormat"
        @update:modelValue="store.setOption('DisableFormat', $event as boolean)"
      />
    </OptionGroup>

    <OptionGroup label="注释与 Include">
      <OptionControl
        label="FixNamespaceComments"
        description="修复命名空间末尾注释"
        type="boolean"
        :modelValue="store.config.FixNamespaceComments"
        @update:modelValue="store.setOption('FixNamespaceComments', $event as boolean)"
      />
      <OptionControl
        label="SortIncludes"
        description="排序 #include 指令"
        type="enum"
        :modelValue="store.config.SortIncludes"
        :enumValues="['Never', 'CaseSensitive', 'CaseInsensitive']"
        @update:modelValue="store.setOption('SortIncludes', $event as any)"
      />
      <OptionControl
        label="IncludeBlocks"
        description="#include 块处理方式"
        type="enum"
        :modelValue="store.config.IncludeBlocks"
        :enumValues="['Preserve', 'Merge', 'Regroup']"
        @update:modelValue="store.setOption('IncludeBlocks', $event as any)"
      />
      <OptionControl
        label="SortUsingDeclarations"
        description="排序 using 声明"
        type="enum"
        :modelValue="store.config.SortUsingDeclarations"
        :enumValues="['Never', 'Lexicographic', 'LexicographicNumeric']"
        @update:modelValue="store.setOption('SortUsingDeclarations', $event as any)"
      />
      <OptionControl
        label="ReflowComments"
        description="重排注释以适应列宽"
        type="enum"
        :modelValue="String(store.config.ReflowComments)"
        :enumValues="['Never', 'IndentOnly', 'Always', 'true', 'false']"
        @update:modelValue="store.setOption('ReflowComments', $event === 'true' ? true : $event === 'false' ? false : $event as any)"
      />
    </OptionGroup>

    <OptionGroup label="代码修改">
      <OptionControl
        label="InsertBraces"
        description="为控制语句插入花括号"
        type="boolean"
        :modelValue="store.config.InsertBraces"
        @update:modelValue="store.setOption('InsertBraces', $event as boolean)"
      />
      <OptionControl
        label="InsertNewlineAtEOF"
        description="文件末尾插入换行"
        type="boolean"
        :modelValue="store.config.InsertNewlineAtEOF"
        @update:modelValue="store.setOption('InsertNewlineAtEOF', $event as boolean)"
      />
      <OptionControl
        label="RemoveBracesLLVM"
        description="移除不必要的花括号（LLVM 风格）"
        type="boolean"
        :modelValue="store.config.RemoveBracesLLVM"
        @update:modelValue="store.setOption('RemoveBracesLLVM', $event as boolean)"
      />
      <OptionControl
        label="RemoveSemicolon"
        description="移除函数定义后多余的分号"
        type="boolean"
        :modelValue="store.config.RemoveSemicolon"
        @update:modelValue="store.setOption('RemoveSemicolon', $event as boolean)"
      />
      <OptionControl
        label="QualifierAlignment"
        description="const/volatile 限定符位置"
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
