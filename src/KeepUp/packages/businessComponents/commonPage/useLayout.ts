import { ref, watch, nextTick, onMounted } from 'vue'

import { Ref } from 'vue'

export const useLayout = (
  containerRef,
  commonFilterRef,
  setterBarRef,
  extraPaneRef,
) => {
  const containerHeight = ref('0px')
  const commonTableRefHeight = ref('0px')
  /** 更新筛选器高度 */
  const updateTableHeight = () => {
    containerHeight.value = containerRef.value.$el.clientHeight
    const table = '15px - 16px - 8px - 24px'
    const elDividerHeight = `${setterBarRef.value.$el.clientHeight}px`
    commonTableRefHeight.value = `calc(${containerHeight.value}px - ${commonFilterRef.value?.getCommonFilterHeight()}px - ${extraPaneRef.value?.clientHeight || 0}px - 8px - 31px - 8px - ${elDividerHeight} - 8px - ${table})`
  }
  /** 目标改变则更新ui层 */
  const watchLayout = (target: Ref<any>[] = []) => {
    watch(() => target.map(v => v.value), async () => {
      await nextTick()
      updateTableHeight()
    }, { deep: true })
  }
  onMounted(async() => {
    setTimeout(() => {
      updateTableHeight()
    }, 250)
  })
  return {
    commonTableRefHeight,
    updateTableHeight,
    watchLayout,
  }
}
