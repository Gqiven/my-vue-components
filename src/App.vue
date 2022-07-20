<script setup lang="ts">
import { ref } from 'vue'
// import VirtualizedCheckGroupSelector from './components/VirtualizedCheckGroupSelector/index.vue'
// import VirtualList from './components/VirtualList'
import VirtualListWithFilter from './components/VirtualListWithFilter/index.vue'

const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

const value = ref('')
const options = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `${initials[idx % 10]}${idx}`,
  label: `Option ${idx + 1}`,
}))
</script>

<template>
  <div>
    <!-- <VirtualizedCheckGroupSelector :options="options" /> -->
    <!-- <VirtualList containerElement="div" :data="options" :height="320"
      :itemSize="32" className="v-list" :initScrollOffset="32" /> -->

    <VirtualListWithFilter
      containerElement="div" :data="options" :height="320"
      :itemSize="32" className="v-list" :initScrollOffset="32"
    />
  </div>
</template>

<style scoped>
.v-list {
  border: 1px solid #d9d9d9;
}
</style>
