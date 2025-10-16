import { defineComponent, ref, h } from 'vue'
import { useRoute } from 'vue-router'
import { ElTabs } from 'element-plus'
import Space from '~/basicComponents/space'
import BasicDataPane from './basicDataPane'
import { tabsSchema, Tabs } from './constants'
import styles from './index.module.scss'
import './index.scss'

export default defineComponent({
  name: 'OverviewPage',
  setup() {
    const route = useRoute()
    const activeName = ref(route.query?.activeKey || Tabs.Detail)
    return () => (
      <Space class={styles.container} direction='column'>
        <BasicDataPane />
        <ElTabs
          class='tabs'
          style={{ width: '100%' }}
          modelValue={activeName.value}
          onUpdate:modelValue={(val: string) => { activeName.value = val }}
        >
          {tabsSchema.map(v => (
            h(
              v['x-decorator'],
              {
                label: v.title,
                name: v.name,
                ...(v['x-decorator-props'] || {}),
              },
              [
                h(
                  v['x-component'],
                  v['x-component-props'] || {},
                ),
              ],
            )
          ))}
        </ElTabs>
      </Space>
    )
  }
})
