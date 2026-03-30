<script setup lang="ts">
import SideNav from './components/SideNav.vue'
import Toolbar from './components/Toolbar.vue'
import CodePreview from './components/CodePreview.vue'
</script>

<template>
  <div class="app-layout">
    <Toolbar />
    <div class="app-body">
      <SideNav />
      <main class="app-content">
        <div class="options-panel">
          <router-view />
        </div>
        <div class="preview-panel">
          <CodePreview />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.options-panel {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  border-right: 1px solid var(--border-color);
  min-width: 380px;
}

.preview-panel {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 300px;
}
</style>
