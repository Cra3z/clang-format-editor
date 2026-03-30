<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const navItems = [
  { path: '/general', label: '通用', icon: '⚙' },
  { path: '/tabs-and-indents', label: '缩进与制表符', icon: '→' },
  { path: '/spaces', label: '空格', icon: '·' },
  { path: '/wrapping-and-braces', label: '换行与花括号', icon: '⏎' },
  { path: '/blank-lines', label: '空行', icon: '¶' },
  { path: '/alignment', label: '对齐', icon: '⇔' },
]

const activePath = computed(() => route.path)
</script>

<template>
  <nav class="side-nav">
    <div class="nav-header">选项分类</div>
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.path">
        <router-link
          :to="item.path"
          class="nav-item"
          :class="{ active: activePath === item.path }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
.side-nav {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

.nav-header {
  padding: 14px 16px 8px;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
}

.nav-list {
  list-style: none;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
  cursor: pointer;
  margin-bottom: 2px;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  &.active {
    background: var(--accent-dim);
    color: var(--accent);
    font-weight: 500;
  }
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
