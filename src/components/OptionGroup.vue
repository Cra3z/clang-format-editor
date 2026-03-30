<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  label: string
  description?: string
  collapsed?: boolean
}>()

const isCollapsed = ref(props.collapsed ?? false)
</script>

<template>
  <div class="option-group" :class="{ collapsed: isCollapsed }">
    <button class="group-header" @click="isCollapsed = !isCollapsed">
      <span class="collapse-icon">{{ isCollapsed ? '▸' : '▾' }}</span>
      <h3 class="group-title">{{ label }}</h3>
    </button>
    <p v-if="description && !isCollapsed" class="group-desc">{{ description }}</p>
    <div v-show="!isCollapsed" class="group-body">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.option-group {
  margin-bottom: 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-secondary);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: background-color var(--transition-fast);

  &:hover {
    background: var(--bg-hover);
  }
}

.collapse-icon {
  font-size: 12px;
  color: var(--text-muted);
  width: 14px;
  flex-shrink: 0;
}

.group-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.group-desc {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  padding: 0 14px 6px;
}

.group-body {
  display: flex;
  flex-direction: column;
  padding: 0 14px 10px;
}
</style>
