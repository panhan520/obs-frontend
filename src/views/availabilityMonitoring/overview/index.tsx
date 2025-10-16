import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getGrafanaApi } from '~/api/availabilityMonitoring/overview'

export default defineComponent({
  name: 'Overview',
  setup() {
    const route = useRoute()
    const url = ref('')
    const init = async () => {
      try {
        const res = await getGrafanaApi({ testId: route.query.testId })
        url.value = res.grafanaUrl
      } catch (error: any) {
        console.error(`初始化历史任务列表失败，失败原因：${error}`)
      }
    }
    init()
    return () => (
      <iframe
        src={url.value}
        frameborder="0" 
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    )
  }
})
