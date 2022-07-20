import { CSSProperties } from "vue"

export type ItemSize = (idx: number) => number

export type StyleValue = string | CSSProperties | Array<StyleValue>