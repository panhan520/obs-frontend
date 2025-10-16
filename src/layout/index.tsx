import { defineComponent, computed } from 'vue'
import { useSettingStore } from '~/store/modules/setting'
import { useResizeHandler } from '~/hooks/useResizeHandler'
import { DeviceType } from '~/constants/common'
import { deviceToLayoutMap } from './constants'
import styles from './index.module.scss'

export default defineComponent({
  name: 'Layout',
  setup() {
    const SettingStore = useSettingStore()
    useResizeHandler()
    const classMap = computed(() => ({
      hideSidebar: !SettingStore.isCollapse,
      openSidebar: SettingStore.isCollapse,
      withoutAnimation: SettingStore.withoutAnimation,
      mobile: SettingStore.device === DeviceType.MOBILE,
      [styles.container]: true
    }))
    const layout = computed(() => deviceToLayoutMap[SettingStore.device])
    return () => (
      <div class={classMap.value}>
        <layout.value />
      </div>
    )
  }
})
