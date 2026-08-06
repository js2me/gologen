<script setup lang="ts">
import { computed, ref } from 'vue';
import { makeIdentIconDataUrl } from '../dist/index.js';

const pageSize = 64;
const startId = ref(4434);

const ids = computed(() =>
  Array.from({ length: pageSize }, (_, index) => startId.value + index),
);

function updateId(value: string) {
  const parsed = Number(value);
  if (Number.isInteger(parsed)) startId.value = parsed;
}
</script>

# Playground

Explore deterministic logos by changing the identifier range.

<div class="playground-controls">
  <button type="button" @click="startId -= pageSize">prev {{ pageSize }}</button>
  <label>
    <span>Starting ID</span>
    <input
      type="number"
      :value="startId"
      step="1"
      @input="updateId(($event.target as HTMLInputElement).value)"
    />
  </label>
  <button type="button" @click="startId += pageSize">next {{ pageSize }}</button>
</div>

<div class="logo-grid">
  <div v-for="id in ids" :key="id" class="logo-item">
    <img :src="makeIdentIconDataUrl(id)" :alt="`Logo for ID ${id}`" />
    <code>{{ id }}</code>
  </div>
</div>

<style>
.playground-controls {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 12px;
  margin: 32px 0;
}

.playground-controls button,
.playground-controls input {
  min-height: 36px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font: inherit;
}

.playground-controls button {
  padding: 0 14px;
  cursor: pointer;
}

.playground-controls button:hover {
  border-color: var(--vp-c-brand-1);
}

.playground-controls label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.playground-controls input {
  width: 120px;
  padding: 0 10px;
}

.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 16px 8px;
}

.logo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.logo-item img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.logo-item code {
  font-size: 11px;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .playground-controls {
    gap: 6px;
  }

  .playground-controls button {
    padding: 0 8px;
    font-size: 12px;
  }
}
</style>
