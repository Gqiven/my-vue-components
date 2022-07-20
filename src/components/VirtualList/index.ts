import { computed, CSSProperties, defineComponent, h, ref, unref, VNodeChild } from "vue";
import { isNumber } from "../../utils";
import { virtualListProps } from './props'

// type Props = {
//   cache: number,
//   estimatedItemSize: number,
//   itemSize: number,
//   height: number,
//   layout: string,
//   width: number,
//   initScrollOffset: number,
//   className: string,
//   containerElement: string,
//   data: [],
//   direction: string,
//   innerElement: string,
//   style: string
// }

export const isHorizontal = (dir: string) =>
  dir === 'ltr' || dir === 'rtl' || dir === 'horizontal'

const getStartIndexForOffset = (total: number, { itemSize }: any, scrollOffset: number): number => {
  return Math.max(0, Math.min(total - 1, Math.floor(scrollOffset / (itemSize as number))))
}

const getStopIndexForStartIndex = ({ height, itemSize, layout, width }: any, total: number, startIndex: number, scrollOffset: number): number => {
  const offset = startIndex * (itemSize as number)
  const size = isHorizontal(layout) ? width : height
  const numVisibleItems = Math.ceil(
    (size as number) / (itemSize as number)
  )
  return Math.max(
    0,
    Math.min(
      total - 1,
      // because startIndex is inclusive, so in order to prevent array outbound indexing
      // we need to - 1 to prevent outbound behavior
      startIndex + numVisibleItems - 1
    )
  )
}

const getItemOffset = ({ itemSize }: any, index: number) => index * (itemSize as number)

const getItemSize = ({ itemSize }: any) => itemSize as number

export default defineComponent({
  name: 'VirtualList',
  props: virtualListProps,
  setup(props) {
    // data
    const states = ref({
      isScrolling: false,
      scrollOffset: isNumber(props.initScrollOffset) ? props.initScrollOffset : 0
    })
    // computed
    const itemsToRender = computed(() => {
      const total = props.data.length// 总数据数量
      const { scrollOffset } = unref(states)
      const startIndex = getStartIndexForOffset(total, props, scrollOffset)
      const endIndex = getStopIndexForStartIndex(props, total, startIndex, scrollOffset)
      return [
        Math.max(0, startIndex),
        Math.min(endIndex, total)
      ]
    })

    const _isHorizontal = computed(() => isHorizontal(props.layout))

    const innerStyle = computed(() => {
      const size = (props.itemSize as number) * props.data.length// 总数据数量
      const horizontal = unref(_isHorizontal)
      return {
        height: horizontal ? '100%' : `${size}px`,
        pointerEvents: unref(states).isScrolling ? 'none' : undefined,
        width: horizontal ? `${size}px` : '100%',
      }
    })

    const scrollVertically = (e: Event) => {
      const { clientHeight, scrollHeight, scrollTop } =
        e.currentTarget as HTMLElement
      const _states = unref(states)
      if (_states.scrollOffset === scrollTop) {
        return
      }

      const scrollOffset = Math.max(
        0,
        Math.min(scrollTop, scrollHeight - clientHeight)
      )

      states.value = {
        ..._states,
        isScrolling: true,
        scrollOffset
      }
    }

    const getItemStyle = (idx: number) => {
      const { direction, itemSize, layout } = props

      let style: CSSProperties
      const offset = getItemOffset(props, idx)
      const size = getItemSize(props)
      const horizontal = unref(_isHorizontal)

      const isRtl = direction === 'rtf'
      const offsetHorizontal = horizontal ? offset : 0
      style = {
        position: 'absolute',
        left: isRtl ? undefined : `${offsetHorizontal}px`,
        right: isRtl ? `${offsetHorizontal}px` : undefined,
        top: !horizontal ? `${offset}px` : 0,
        height: !horizontal ? `${size}px` : '100%',
        width: horizontal ? `${size}px` : '100%',
      }

      return style
    }

    return {
      itemsToRender,
      innerStyle,
      states,
      onScroll: scrollVertically,
      getItemStyle
    }
  },
  render(ctx: any) {
    let {
      containerElement,
      className,
      data,
      itemsToRender,
      height,
      width,
      innerStyle,
      onScroll,
      getItemStyle
    } = ctx

    const total = data.length
    const [startIndex, endIndex] = itemsToRender

    const children = [] as VNodeChild[]
    if(total > 0) {
      for(let i = startIndex; i < endIndex; i++) {
        children.push(
          h('div', {
            style: getItemStyle(i)
          }, data[i].label)
        )
      }
    }

    const InnerNode = h(
      'div',
      {
        style: innerStyle
      },
      [children]
    )
    

    const listContainer = h(
      containerElement,
      {
        className,
        style: `position: relative; overflow-y: scroll; will-change: transform; direction: ltr; height: ${height}px; width: ${width || 500}px`,
        onScroll
      },
      [InnerNode]
    )

    return h(
      listContainer
    )
  }
})