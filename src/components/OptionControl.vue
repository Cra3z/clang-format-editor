<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  description?: string
  type: 'boolean' | 'integer' | 'enum' | 'string'
  modelValue: unknown
  enumValues?: string[]
  min?: number
  max?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
}>()

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function handleNumberInput(e: Event) {
  const target = e.target as HTMLInputElement
  const num = parseInt(target.value, 10)
  if (!isNaN(num)) {
    emit('update:modelValue', num)
  }
}

function handleBooleanToggle() {
  emit('update:modelValue', !value.value)
}
</script>

<template>
  <div class="option-control" :title="description">
    <label class="option-label">
      <span class="label-text">{{ label }}</span>

      <!-- Boolean -->
      <button
        v-if="type === 'boolean'"
        class="toggle-btn"
        :class="{ active: !!value }"
        @click="handleBooleanToggle"
        role="switch"
        :aria-checked="!!value"
      >
        <span class="toggle-indicator" />
      </button>

      <!-- Enum -->
      <select
        v-else-if="type === 'enum'"
        :value="value"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="v in enumValues" :key="v" :value="v">{{ v }}</option>
      </select>

      <!-- Integer -->
      <input
        v-else-if="type === 'integer'"
        type="number"
        :value="value"
        :min="min"
        :max="max"
        @input="handleNumberInput"
        class="number-input"
      />

      <!-- String -->
      <input
        v-else
        type="text"
        :value="value"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="text-input"
      />
    </label>
    <span v-if="description" class="option-desc">{{ description }}</span>
  </div>
</template>

<style scoped lang="scss">
.option-control {
  padding: 7px 6px;
  border-bottom: 1px solid var(--border-light);
  transition: background-color var(--transition-fast);
  border-radius: var(--radius-sm);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg-hover);
  }
}

.option-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
}

.label-text {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-desc {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: 2px;
  padding-left: 2px;
}

/* Toggle switch */
.toggle-btn {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 0;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;

  &.active {
    background: var(--accent);
    border-color: var(--accent);
  }
}

.toggle-indicator {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  transition: transform var(--transition-fast);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);

  .active & {
    transform: translateX(16px);
  }
}

.number-input {
  width: 80px;
  text-align: center;
}

.text-input {
  width: 200px;
}

select {
  min-width: 160px;
}
</style>
