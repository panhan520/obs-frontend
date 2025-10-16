import { defineComponent, ref, nextTick } from 'vue'
import { CommonPage } from '~/businessComponents'
import { getListApi, getGrafanaUrlApi } from '~/api/availabilityMonitoring/alarm'
import useAvailabilityMasterData from '~/store/modules/useAvailabilityMasterData'
import { getFields } from './fields'

import type { Field } from '@formily/core'
import type { ICommonObj } from '~/interfaces/common'
import type { IExpose } from '~/businessComponents/commonPage'

export default defineComponent({
  name: 'Alarm',
  setup() {
    const commonPageRef = ref<IExpose>()
    const grafanaUrl = ref('')
    const filterParams = ref({})
    const fields = ref(getFields())
    const masterDataStore = useAvailabilityMasterData()
    const getGrafanaUrl = async () => {
      try {
        const res = await getGrafanaUrlApi(filterParams.value)
        grafanaUrl.value = res.grafanaUrl
      } catch (error: any) {
        console.error(`获取grafanaUrl失败，失败原因：${error}`)
      }
    }
    const formatListParams = async (params: ICommonObj) => {
      const result = {
        probeSubdivision: params?.node?.[0],
        probeRegionName: params?.node?.[1],
        ...Object.fromEntries(Object.entries(params).filter(([k, v]) => !['node'].includes(k))),
        fromTime: params.fromTime ? new Date(params.fromTime).toISOString() : undefined,
        toTime: params.toTime ? new Date(params.toTime).toISOString() : undefined,
      }
      filterParams.value = result
      await getGrafanaUrl()
      return result
    }
    const init = async () => {
      try {
        await masterDataStore.getMonitoringNodes()
        await getGrafanaUrl()
        await nextTick()
        const formRef = commonPageRef.value.getFilterForm()
        const node = formRef.query('space.grid.monitoringNodeName.void.node')?.take() as Field
        const probeIspName = formRef.query('space.grid.monitoringNodeName.void.probeIspName')?.take() as Field
        node.setDataSource(masterDataStore.masterData.monitoringNodes)
        probeIspName.setDataSource(masterDataStore.masterData.monitoringIsps)
      } catch (error: any) {
        console.error(`初始化历史任务列表失败，失败原因：${error}`)
      }
    }
    init()
    return () => (
      <CommonPage
        ref={commonPageRef}
        fields={fields.value}
        listApi={getListApi}
        formatListParams={formatListParams}
        pageKey='alarm'
        filterColumns={5}
        rowKey='testId'
        refreshable
        needPagination
        v-slots={{
          extraPane: () =>  <iframe 
            src={grafanaUrl.value}
            frameborder="0" 
            style={{
              width: '100%',
            }}
          />,
        }}
      />
    )
  }
})
