import { h, computed } from 'vue'
import { ROUTER_KEY, getLevelMap } from './constants'

import type { IUseLevelConfigMapParams, IUseLevelConfigMapRes, IDeepRenderParams, ILevelMapItem } from './interfaces'

/** 生成顶部菜单渲染器 */
const useLevelConfigMap = ({
  names,
  router,
}: IUseLevelConfigMapParams): IUseLevelConfigMapRes => {
  try {
    const levelMap = computed<(ILevelMapItem | null)[]>(() => getLevelMap(names.value)) // 菜单层级到对应配置的map
    /** 顶部菜单渲染器 */
    const deepRender = ({ route, level }: IDeepRenderParams) => {
      if (!route.children?.length) {
        return
      }
      const childLevel = level + 1 // 子路由层级
      const childLevelConfig = levelMap.value[childLevel] // 子路由配置
      const childRoutes = (route?.children || []).filter(v => !v.meta?.headerHidden) // 子路由
      const curChildRoute = (route.children || [])
        .find(v => v[ROUTER_KEY] === names.value?.[childLevel]) // 选中态子路由
      const curChildRouteChildren = curChildRoute?.children // 选中态子路由的子路由
      /** 渲染子菜单，当前菜单没用到 */
      return h(
        levelMap.value[childLevel]?.['x-decorator'],
        { 
          direction: 'column', 
          align: 'start', 
          fill: true, 
          style: {
            ...(childLevel === 2 ? { marginTop: '24px' } : {}),
            ...(!curChildRouteChildren?.length && childLevel >= 2 ? { marginBottom: '24px' } : {}),
          },
          ...(levelMap.value[childLevel]?.['x-decorator-props'] || {}),
        },
        [
          childRoutes.length
            ? 
              childLevelConfig?.['x-component']?.({
                routes: childRoutes, 
                activeKey: levelMap.value[childLevel]?.activeKey,
                router,
              })
            : null,
          curChildRoute
            ? deepRender({
                route: curChildRoute, 
                level: childLevel,
              })
            : null,
        ]
      )
    }
    return {
      deepRender,
    }
  } catch (error: any) {
    console.error(`顶部菜单渲染失败，失败原因：${error}`)
  }
}

export default useLevelConfigMap
