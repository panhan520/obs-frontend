import type { Ref } from 'vue'
import type { Form } from '@formily/core'

/** CommonFilter出参 */
export type ICommonFilterExpose = {
  /** 可折叠 */
  collapsible: Ref<boolean>
  /** 展开收起 */
  visible: Ref<boolean>
  /** 展开收起 */
  collapse: () => void
  /** 获取form实例 */
  getForm: () => Form
  /** 重置筛选条件 */
  reset: () => void
  /** 获取筛选器高度 */
  getCommonFilterHeight: () => number
}

/** 操作 */
export interface IOperateActions {
  /** 查询 */
  query: () => Promise<void>
  /** 重置 */
  reset: () => Promise<void>
}
