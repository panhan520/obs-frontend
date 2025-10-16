import { defineComponent } from 'vue'
import { useSettingStore } from '~/store/modules/setting'

export default defineComponent({
  name: 'MobileMask',
  setup() {
  const SettingStore = useSettingStore()
  // 移动端点击
  const handleClickOutside = () => {
    SettingStore.closeSideBar({ withoutAnimation: false })
  }
    return () => (
      <div class="drawer-bg" onClick={handleClickOutside} />
    )
  }
})
