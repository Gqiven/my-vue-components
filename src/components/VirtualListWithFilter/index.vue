<template>
  <div>
    <input type="text" placeholder="请输入关键词" class="filter-input" style="width: 500px" @change="emitFilter">
    <VirtualList containerElement="div" :data="data" :height="320"
      :itemSize="32" className="v-list" :initScrollOffset="32"
      ref="vList" />
  </div>  
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import VirtualList from "../VirtualList";
import { virtualListProps } from '../VirtualList/props'

const props = defineProps({
  ...virtualListProps,
  filter: {
    type: Boolean,
    default: true
  }
})

let vList = ref()

const emitFilter = (e: any) => {
  let filterIndex = Number(e.target.value)
  vList.value.scrollToItem(filterIndex)
}
</script>

<style lang="scss" scoped>
.filter-input {
  line-height: 32px;
  border-radius: 2px;
  border: 1px solid #d9d9d9;
  padding-left: 10px;
  &:visited, &:hover, &:active {
    border: 1px solid #409eff;
  }
}
</style>
