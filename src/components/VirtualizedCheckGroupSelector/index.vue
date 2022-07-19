<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
// import { ChecboxSelectorProps } from './index'
type DataItem = {
  value: number | string,
  label: string
}
// ChecboxSelectorProps
const props = defineProps({
  itemHeight: {// 单行高度
    type: Number,
    default: 32
  },
  showNumber: {// 可见的最大行数
    type: Number,
    default: 10
  },
  options: {
    type: Array,
    default: []
  },
  hasCheckAll: {
    type: Boolean,
    default: true
  }
})

type ValueItemType = string | number

type OptionsMapType = {
  [key: string]: DataItem
}

const checkAll = ref(false)
const isIndeterminate = ref(false)
let checkedValues = ref<Array<DataItem>>([])
let visibleCheckedValues = ref<Array<ValueItemType>>([])
const startIndex = ref(0)
const scrollContainer = ref()
const startOffset = ref(0)

const selectorHeight = computed(() => {
  return props.itemHeight * props.showNumber
})

const totalCount = computed(() => {
  let addCount = props.hasCheckAll ? 1 : 0
  return (props.options as []).length + addCount
})
const scrollContainerHeight = computed(() => {
  return props.itemHeight * totalCount.value
})

const endIndex = computed(() => {
  return Math.min(totalCount.value, startIndex.value + props.showNumber)
})

const visibleData = computed(() => {
  return (props.options as []).slice(startIndex.value, endIndex.value)
})

const optionsMap = computed(() => {
  return props.options.reduce((map, item) => {
    (map as any)[(item as DataItem).value] = item
    return map
  }, {})
})
console.log(333, optionsMap)

const handleCheckAllChange = (checked: boolean) => {
  isIndeterminate.value = false
  if(checked) {
    checkedValues.value = (props.options as []).map((item: DataItem) => ({value: item.value, label: item.label }))
    visibleCheckedValues.value = (props.options as []).map((item: DataItem) => item.value)
  }else {
    checkedValues.value = []
    visibleCheckedValues.value = []
  }
}
const handleCheckedChange = (v: ValueItemType[]) => {
  if(v.length === totalCount.value) {
    checkAll.value = true
    isIndeterminate.value = false
  }else {
    checkAll.value = false
  }
  if(v.length > 0) {
    isIndeterminate.value = true
  }
  checkedValues.value = v.map(value => (optionsMap as any).value[value.toString()])
}
const handleScroll = () => {
  let scrollTop = scrollContainer.value.scrollTop
  startIndex.value = Math.floor(scrollTop / props.itemHeight)
  startOffset.value = scrollTop - (scrollTop % props.itemHeight)
}
</script>

<template>
  <div class="checkgroup-selector flex-box">
    <div class="box scroll-wrap" :style="`height: ${selectorHeight}px`" ref="scrollContainer" @scroll="handleScroll">
      <div :style="`height: ${scrollContainerHeight}px; transform: translate3d(0,${startOffset}px,0)`">
        <el-checkbox
          v-if="hasCheckAll"
          v-show="startOffset < 1"
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >全选</el-checkbox>
        <el-checkbox-group
          v-model="visibleCheckedValues"
          @change="handleCheckedChange"
        >
          <el-checkbox v-for="{ value, label } in visibleData" :key="value" :label="value">{{ label }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div class="box scroll-wrap" :style="`height: ${selectorHeight}px`">
      <div class="title-box">已选（{{ checkedValues.length }}）</div>
      <ul>
        <li v-for="{ value, label } in checkedValues" :key="value">{{ label}}（{{ value }}）</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.flex-box {
  display: flex;
}
.box {
  padding: 6px;
  border-radius: 2px;
  border: 1px solid #d9d9d9;
}
.scroll-wrap {
  overflow-y: scroll;
}
.title-box {
  line-height: 40px;
  padding: 4px 16px 0;
  font-weight: 700;
  border-bottom: 1px solid #d9d9d9;
}
</style>

<style lang="scss">
.checkgroup-selector {
  .el-checkbox {
    display: block;
  }
}
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}
::-webkit-scrollbar-track {
  border-radius: 10px;
}
</style>
