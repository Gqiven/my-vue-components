import { warn } from "vue"
import { isObject } from "."
import { fromPairs } from "./tools"
import { Mutable } from "./types"

const wrapperKey = Symbol()

export const propKey = Symbol()

export type PropWrapper<T> = { [wrapperKey]: T }

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

type PropMethod<T, TConstructor = any> = [T] extends [
  ((...args: any) => any) | undefined
] // if is function with args, allowing non-required functions
  ? { new (): TConstructor; (): T; readonly prototype: TConstructor } // Create Function like constructor
  : never

type PropConstructor<T = any> =
  | { new (...args: any[]): T & {} }
  | { (): T }
  | PropMethod<T>

export type Data = Record<string, unknown>

export type PropType<T> = PropConstructor<T> | PropConstructor<T>[]

type DefaultFactory<T> = (props: Data) => T | null | undefined

export interface PropOptions<T = any, D = T> {
  type?: PropType<T> | true | null
  required?: boolean
  default?: D | DefaultFactory<D> | null | undefined | object
  validator?(value: unknown): boolean
}

export type Prop<T, D = T> = PropOptions<T, D> | PropType<T>

type InferPropType<T> = [T] extends [null]
  ? any // null & true would fail to infer
  : [T] extends [{ type: null | true }]
  ? any // As TS issue https://github.com/Microsoft/TypeScript/issues/14829 // somehow `ObjectConstructor` when inferred from { (): T } becomes `any` // `BooleanConstructor` when inferred from PropConstructor(with PropMethod) becomes `Boolean`
  : [T] extends [ObjectConstructor | { type: ObjectConstructor }]
  ? Record<string, any>
  : [T] extends [BooleanConstructor | { type: BooleanConstructor }]
  ? boolean
  : [T] extends [DateConstructor | { type: DateConstructor }]
  ? Date
  : [T] extends [(infer U)[] | { type: (infer U)[] }]
  ? U extends DateConstructor
    ? Date | InferPropType<U>
    : InferPropType<U>
  : [T] extends [Prop<infer V, infer D>]
  ? unknown extends V
    ? IfAny<V, V, D>
    : V
  : T


type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends
    | { required: true }
    | { default: any }
    // don't mark Boolean props as undefined
    | BooleanConstructor
    | { type: BooleanConstructor }
    ? T[K] extends { default: undefined | (() => undefined) }
      ? never
      : K
    : never
}[keyof T]


type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>

export type ExtractPropTypes<O> = {
  // use `keyof Pick<O, RequiredKeys<O>>` instead of `RequiredKeys<O>` to support IDE features
  [K in keyof Pick<O, RequiredKeys<O>>]: InferPropType<O[K]>
} & {
  // use `keyof Pick<O, OptionalKeys<O>>` instead of `OptionalKeys<O>` to support IDE features
  [K in keyof Pick<O, OptionalKeys<O>>]?: InferPropType<O[K]>
}


type ResolveProp<T> = ExtractPropTypes<{
  key: { type: T; required: true }
}>['key']
type ResolvePropType<T> = ResolveProp<T> extends { type: infer V }
  ? V
  : ResolveProp<T>

type ResolvePropTypeWithReadonly<T> = Readonly<T> extends Readonly<
  Array<infer A>
>
  ? ResolvePropType<A[]>
  : ResolvePropType<T>

type IfUnknown<T, V> = [unknown] extends [T] ? V : T

type _BuildPropType<T, V, C> =
| (T extends PropWrapper<unknown>
    ? T[typeof wrapperKey]
    : [V] extends [never]
    ? ResolvePropTypeWithReadonly<T>
    : never)
| V
| C
export type BuildPropType<T, V, C> = _BuildPropType<
  IfUnknown<T, never>,
  IfUnknown<V, never>,
  IfUnknown<C, never>
>

type _BuildPropDefault<T, D> = [T] extends [
  // eslint-disable-next-line @typescript-eslint/ban-types
  Record<string, unknown> | Array<any> | Function
]
  ? D
  : D extends () => T
  ? ReturnType<D>
  : D

export type BuildPropDefault<T, D, R> = R extends true
  ? { readonly default?: undefined }
  : {
      readonly default: Exclude<D, undefined> extends never
        ? undefined
        : Exclude<_BuildPropDefault<T, D>, undefined>
    }

export type BuildPropReturn<T, D, R, V, C> = {
  readonly type: PropType<BuildPropType<T, V, C>>
  readonly required: IfUnknown<R, false>
  readonly validator: ((val: unknown) => boolean) | undefined
  [propKey]: true
} & BuildPropDefault<
  BuildPropType<T, V, C>,
  IfUnknown<D, never>,
  IfUnknown<R, false>
>

type NativePropType = [
  ((...args: any) => any) | { new (...args: any): any } | undefined | null
]


export type BuildPropOption<T, D extends BuildPropType<T, V, C>, R, V, C> = {
  type?: T
  values?: readonly V[]
  required?: R
  default?: R extends true
    ? never
    : D extends Record<string, unknown> | Array<any>
    ? () => D
    : (() => D) | D
  validator?: ((val: any) => val is C) | ((val: any) => boolean)
}




export function buildProp<
  T = never,
  D extends BuildPropType<T, V, C> = never,
  R extends boolean = false,
  V = never,
  C = never
>(
  option: BuildPropOption<T, D, R, V, C>,
  key?: string
): BuildPropReturn<T, D, R, V, C> {
  // filter native prop type and nested prop, e.g `null`, `undefined` (from `buildProps`)
  if (!isObject(option) || !!option[propKey]) return option as any

  const { values, required, default: defaultValue, type, validator } = option

  const _validator =
    values || validator
      ? (val: unknown) => {
          let valid = false
          let allowedValues: unknown[] = []

          if (values) {
            allowedValues = [...values, defaultValue]
            valid ||= allowedValues.includes(val)
          }
          if (validator) valid ||= validator(val)

          if (!valid && allowedValues.length > 0) {
            const allowValuesText = [...new Set(allowedValues)]
              .map((value) => JSON.stringify(value))
              .join(', ')
            warn(
              `Invalid prop: validation failed${
                key ? ` for prop "${key}"` : ''
              }. Expected one of [${allowValuesText}], got value ${JSON.stringify(
                val
              )}.`
            )
          }
          return valid
        }
      : undefined

  return {
    type:
      typeof type === 'object' &&
      Object.getOwnPropertySymbols(type).includes(wrapperKey)
        ? type[wrapperKey]
        : type,
    required: !!required,
    default: defaultValue,
    validator: _validator,
    [propKey]: true,
  } as unknown as BuildPropReturn<T, D, R, V, C>
}

export const buildProps = <
  O extends {
    [K in keyof O]: O[K] extends BuildPropReturn<any, any, any, any, any>
      ? O[K]
      : [O[K]] extends NativePropType
      ? O[K]
      : O[K] extends BuildPropOption<
          infer T,
          infer D,
          infer R,
          infer V,
          infer C
        >
      ? D extends BuildPropType<T, V, C>
        ? BuildPropOption<T, D, R, V, C>
        : never
      : never
  }
>(
  props: O
) =>
  fromPairs(
    Object.entries(props).map(([key, option]) => [
      key,
      buildProp(option as any, key),
    ])
  ) as unknown as {
    [K in keyof O]: O[K] extends { [propKey]: boolean }
      ? O[K]
      : [O[K]] extends NativePropType
      ? O[K]
      : O[K] extends BuildPropOption<
          infer T,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          infer _D,
          infer R,
          infer V,
          infer C
        >
      ? BuildPropReturn<T, O[K]['default'], R, V, C>
      : never
  }


export const definePropType = <T>(val: any) =>
  ({ [wrapperKey]: val } as PropWrapper<T>)

export const mutable = <T extends readonly any[] | Record<string, unknown>>(
    val: T
  ) => val as Mutable<typeof val>