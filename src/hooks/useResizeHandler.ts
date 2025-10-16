import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingStore } from '~/store/modules/setting'
import { DeviceType } from '~/constants/common'

const { body } = document

const WIDTH = 800 // refer to Bootstrap's responsive design
const MAX_WIDTH = 1200

export const useResizeHandler = () => {
  const SettingStore = useSettingStore()
  const route = useRoute()
  const device = computed(() => SettingStore.device)
  function $_isMobile() {
    const rect = body.getBoundingClientRect()
    return rect?.width - 1 < WIDTH
  }

  function collapse() {
    const rect = body.getBoundingClientRect()
    return (rect?.width - 1) > MAX_WIDTH
  }

  function $_resizeHandler() {
    if (!document.hidden) {
      // bool型，表示页面是否处于隐藏状态。页面隐藏包括页面在后台标签页或者浏览器最小化
      const isMobile = $_isMobile()
      const isCollapse = collapse()
      SettingStore.toggleDevice(isMobile ? DeviceType.MOBILE : DeviceType.PC)

      if (isMobile) {
        SettingStore.closeSideBar({ withoutAnimation: true })
      }

      if (!isMobile) {
        SettingStore.setCollapse(isCollapse)
      }
    }
  }

  onMounted(() => {
    const isMobile = $_isMobile()
    if (isMobile) {
      SettingStore.toggleDevice(DeviceType.MOBILE)
      SettingStore.closeSideBar({ withoutAnimation: true })
    }
    window.addEventListener('resize', $_resizeHandler)

    watch(route, () => {
      if (device.value === DeviceType.MOBILE && SettingStore.isCollapse) {
        SettingStore.closeSideBar({ withoutAnimation: false })
      }
    })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', $_resizeHandler)
  })

  return { device }
}
