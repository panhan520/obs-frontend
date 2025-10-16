import { defineComponent, ref, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import { getTabsToConfig } from './constants'
import styles from './index.module.scss'

export default defineComponent({
  name: 'Detail',
  setup() {
    const route = useRoute()
    const tabsToConfig = computed(() => getTabsToConfig({ route }))
    const activeName = ref(tabsToConfig.value?.[0]?.prop)
    return () => (
      <el-tabs
        modelValue={activeName} 
        class={styles.container}
      >
        {tabsToConfig.value.map(v => (
          <el-tab-pane label={v.label} name={v.prop}>
            {h(v['x-component'], v['x-component-props'])}
          </el-tab-pane>
        ))}
      </el-tabs>
    )
  }
})
