import { defineComponent, ref, computed, onMounted } from 'vue'
import { useSettingStore } from '~/store/modules/setting'
import { useRect } from '~/store/modules/useRect'
import { useResizeHandler } from '~/hooks/useResizeHandler'
import { DeviceType } from '~/constants/common'
import { deviceToLayoutMap } from './constants'
import styles from './index.module.scss'

export default defineComponent({
  name: 'Layout',
  setup() {
    const containerRef = ref()
    const rectStore = useRect()
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
    onMounted(() => {
      rectStore.appHeight = containerRef.value?.clientHeight
    })
    return () => (
      <div ref={containerRef} class={[classMap.value, 'obs-container']}>
        <layout.value />
      </div>
    )
  }
})
