import { HeaderMode } from '@/routers/constants'

import type { VNode, DefineComponent } from 'vue'
import type { Router, RouteRecordRaw } from 'vue-router'

/** 对象 */
export interface ICommonObj {
  [k: string]: any
}

/** upload组件的文件格式 */
export interface IUploadFile {
  /** 文件名 */
  name: string
  /** url */
  url: string
}

/** 获取列表出参 */
export interface ICommonGetListRes<L> {
  /** list */
  list: L
  /** 分页信息 */
  pagination: {
    /** 页码 */
    page: number
    /** 每页展示条数 */
    pageSize: number
    /** 总条目 */
    total: number
  }
}

/** 获取列表 */
export type IListApi = (p?: ICommonObj) => Promise<ICommonGetListRes<any[]>>

/** Option Item */
export interface IOptionItem {
  /** 键名 */
  label: string
  /** 值 */
  value: string | number
}

/** action入参 */
interface IActionParams {
  router: Router
}
/** action */
type IAction = (p?: IActionParams) => Promise<void> | void

/** 路由元配置 */
export type IRouteRecordRaw = RouteRecordRaw & {
  meta?: {
    /** 层级 */
    level?: number
    /** 强制作为菜单组展示 */
    alwaysShow?: boolean
    /** 左侧菜单隐藏 */
    hidden?: boolean
    /** 顶部菜单隐藏 */
    headerHidden?: boolean
    /** 缓存 */
    keepAlive?: boolean
    /** 标题 */
    title?: string
    /** 图标 */
    icon?: DefineComponent | VNode | string
    /** 是标签 */
    affix?: boolean
    /** 是面包屑 */
    breadcrumb?: boolean
    /** 顶部菜单展示形式 */
    headerMode?: HeaderMode
    /** 面包屑（自定义面包屑的数据） */
    breadcrumbConfig?: Record<'label' | 'name', string>[]
    /** 动作 */
    action?: IAction
  }
  children?: IRouteRecordRaw[]
}
