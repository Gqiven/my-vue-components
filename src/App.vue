<script setup lang="ts">
import { ref } from 'vue'
import VirtualizedCheckGroupSelector from './components/VirtualizedCheckGroupSelector/index.vue'

const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

const value = ref('')
const options = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `${initials[idx % 10]}${idx}`,
  label: `Option ${idx + 1}`,
}))
</script>

<template>
  <div>
    <VirtualizedCheckGroupSelector :options="options" />
  </div>
</template>

<style scoped>

</style>
