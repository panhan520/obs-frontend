import type { VNode, Component, ComputedRef } from 'vue'
import type { Router } from 'vue-router'
import type { IRouteRecordRaw } from '~/interfaces/common'

/** 单层级菜单渲染器入参 */
export interface IRenderParams {
  /** 路由 */
  routes?: IRouteRecordRaw[]
  /** 选中态路由Name */
  activeKey?: string
  /** 路由控制器 */
  router: Router
}

/** 层级配置 */
export interface ILevelMapItem {
  /** 对应层级选中态路由的name */
  activeKey?: string
  /** 容器 */
  'x-decorator'?: Component
  /** 容器props */
  'x-decorator-props'?: Record<string, any>
  /** 对应层级的菜单渲染器 */
  'x-component'?: (p: IRenderParams) => VNode
  /** 菜单组件props */
  'x-component-props'?: Record<string, any>
}

/** 顶部整体菜单渲染器入参 */
export interface IDeepRenderParams {
  /** 对应层级路由 */
  route: IRouteRecordRaw
  /** 对应层级 */
  level: number
}

/** useLevelConfigMap入参 */
export interface IUseLevelConfigMapParams {
  /** 路由链names集合 */
  names: ComputedRef<string[]>
  /** 路由控制器 */
  router: Router
}

/** useLevelConfigMap出参 */
export interface IUseLevelConfigMapRes {
  /** 顶部菜单渲染器 */
  deepRender: (p: IDeepRenderParams) => VNode
}
