import { defineComponent, ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore } from '~/store/modules/permission'
import { useRect } from '~/store/modules/useRect'
import useLevelConfigMap from './useLevelConfigMap'
import { ROUTER_KEY } from './constants'
import styles from './index.module.scss'

import type { IRouteRecordRaw } from '~/interfaces/common'

export default defineComponent({
  name: 'SubMenuBar',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const rectStore = useRect()
    const PermissionStore = usePermissionStore()
    /** 路由链name集合 */
    const names = computed(() => (route?.matched || []).map(v => v.name as string))
    const curRoute = computed(() => (PermissionStore.permissionRoutes as IRouteRecordRaw[]).find(v => v[ROUTER_KEY] === route.matched?.[0]?.[ROUTER_KEY])) // 获取有权限的路由
    const { deepRender } = useLevelConfigMap({ names, router })
    const containerRef = ref()
    watch(() => route.name, async () => {
      await nextTick()
      rectStore.headerHeight = containerRef.value?.clientHeight || 0
    }, { immediate: true, deep: true })
    return () => (
      <div class={styles.container} ref={containerRef}>
        {
          deepRender({
            route: curRoute.value, 
            level: 0,
          })
        }
      </div>
    )
  }
})
