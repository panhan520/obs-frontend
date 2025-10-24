import { defineComponent, computed, Transition, KeepAlive } from 'vue'
import { RouterView } from 'vue-router'
import { useWrapComponents } from '~/hooks/useWrapComponents'
import { useSettingStore } from '~/store/modules/setting'
import { usePermissionStore } from '~/store/modules/permission'
import { useRect } from '~/store/modules/useRect'
import styles from './index.module.scss'

export default defineComponent({
  name: 'Main',
  setup() {
    const SettingStore = useSettingStore()
    const PermissionStore = usePermissionStore()
    const rectStore = useRect()
    const cacheRoutes = computed(() => PermissionStore.keepAliveRoutes)
    const isReload = computed(() => SettingStore.isReload)
    const mainHeight = computed(() => `${rectStore.appHeight - rectStore.headerHeight}px`)
    return () => (
      <div class={['app-main', styles.appMain]} style={{ height: mainHeight.value }}>
        <RouterView>
          {
            ({ Component, route }) => (
              <Transition 
                name="fade-slide" 
                mode="out-in" 
                appear
              >
                {
                  isReload.value 
                    && <KeepAlive include={cacheRoutes.value}>
                      {useWrapComponents(Component, route)}
                    </KeepAlive>
                }
              </Transition>
            )
          }
        </RouterView>
      </div>
    )
  }
})
