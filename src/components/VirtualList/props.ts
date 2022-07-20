import { buildProp, definePropType, mutable } from "../../utils/props";
import { ItemSize, StyleValue } from "./types";

export const HORIZONTAL = 'horizontal'
export const VERTICAL = 'vertical'

export const virtualListProps = {
  cache: {
    type: Number,
    default: 2,
  },

  estimatedItemSize: {
    type: Number,
  },

  /**
   * @description controls the list's orientation
   */
  layout: {
    type: String,
    values: ['horizontal', 'vertical'],
    default: VERTICAL,
  },

  initScrollOffset: {
    type: Number,
    default: 0,
  },

  /**
   * @description describes the total number of the list.
   */
  // total: {
  //   type: Number,
  //   required: true,
  // },

  itemSize: {
    type: Number,//[Number, Function],//definePropType<number | ItemSize>([Number, Function]),
    required: true,
  },
  // ...virtualizedProps,
  className: {
    type: String,
    default: '',
  },

  containerElement: {
    type: String,//[String, Object],//definePropType<string | Element>([String, Object]),
    default: 'div',
  },

  data: {
    type: Array,//definePropType<any[]>(Array),
    default: () => mutable([] as const),
  },

  /**
   * @description controls the horizontal direction.
   */
  direction: {
    type: String,
    values: ['ltr', 'rtl'],
    default: 'ltr',
  },

  height: {
    type: [String, Number],
    required: true,
  },

  innerElement: {
    type:  String,//[String, Object],
    default: 'div',
  },

  style: {
    type: String,// [Object, String, Array],//definePropType<StyleValue>([Object, String, Array]),
  },

  // useIsScrolling: {
  //   type: Boolean,
  //   default: false,
  // },

  width: {
    type: [Number, String],
    required: false,
  },

  // perfMode: {
  //   type: Boolean,
  //   default: true,
  // },
  // scrollbarAlwaysOn: {
  //   type: Boolean,
  //   default: false,
  // },
}

/*
const cache = buildProp({
  type: Number,
  default: 2,
} as const)

const estimatedItemSize = buildProp({
  type: Number,
} as const)

const layout = buildProp({
  type: String,
  values: ['horizontal', 'vertical'],
  default: VERTICAL,
} as const)

const initScrollOffset = buildProp({
  type: Number,
  default: 0,
} as const)

const total = buildProp({
  type: Number,
  required: true,
} as const)

const itemSize = buildProp({
  type: definePropType<number | ItemSize>([Number, Function]),
  required: true,
} as const)

export const virtualizedProps = buildProps({
  className: {
    type: String,
    default: '',
  },

  containerElement: {
    type: definePropType<string | Element>([String, Object]),
    default: 'div',
  },

  data: {
    type: definePropType<any[]>(Array),
    default: () => mutable([] as const),
  },

  // @description controls the horizontal direction.
  direction,

  height: {
    type: [String, Number],
    required: true,
  },

  innerElement: {
    type: [String, Object],
    default: 'div',
  },

  style: {
    type: definePropType<StyleValue>([Object, String, Array]),
  },

  useIsScrolling: {
    type: Boolean,
    default: false,
  },

  width: {
    type: [Number, String],
    required: false,
  },

  perfMode: {
    type: Boolean,
    default: true,
  },
  scrollbarAlwaysOn: {
    type: Boolean,
    default: false,
  },
} as const)

const direction = buildProp({
  type: String,
  values: ['ltr', 'rtl'],
  default: 'ltr',
} as const)
*/