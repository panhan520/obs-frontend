import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getTaskBasicDataApi } from '~/api/availabilityMonitoring'
import { Protocol, ResultStatus } from '~/api/availabilityMonitoring/constants'
import Space from '~/basicComponents/space'
import styles from './index.module.scss'

import type { IBasicTaskData } from '~/api/availabilityMonitoring/interfaces'

export default defineComponent({
  name: 'BasicDataPane',
  setup() {
    const route = useRoute()
    const basicData = ref<Partial<IBasicTaskData>>({})
    const init = async () => {
      basicData.value = await getTaskBasicDataApi({ testId: route.query.testId as string })
    }
    init()
    return () => (
      <Space class={styles.container} justify='start' fill size={16} style={{ padding: '16px', boxSizing: 'border-box' }}>
        <div class={[styles.circle, basicData.value.testResults === ResultStatus.PASSED ? styles.success : styles.fail]}></div>
        <Space direction='column' align='start' size={0}>
          <div style={{ fontWeight: 'bold' }}>任务名称：{basicData.value.taskName}</div>
          <Space size={16}>
            <div style={{ fontWeight: 'bold' }}>请求类型: {basicData.value.requestType}</div>
            {basicData.value.requestType !== Protocol.HTTP && <div style={{ fontWeight: 'bold' }}>host: {basicData.value.host}</div>}
            {basicData.value.requestType !== Protocol.HTTP && <div style={{ fontWeight: 'bold' }}>port: {basicData.value.port}</div>}
            {basicData.value.requestType === Protocol.HTTP && <div style={{ fontWeight: 'bold' }}>URL: {basicData.value.url}</div>}
            <div style={{ fontWeight: 'bold' }}>监测频率: {basicData.value.monitoringFrequency}</div>
          </Space>
        </Space>
      </Space>
    )
  }
})
