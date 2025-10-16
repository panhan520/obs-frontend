import { defineComponent, ref, computed, nextTick, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElTag } from 'element-plus'
import { getTaskHistory, getHistoryTaskDetail } from '~/api/availabilityMonitoring'
import { Protocol, taskResultStatusMap, taskResultStatusStyleMap, TaskResultStatus } from '~/api/availabilityMonitoring/constants'
import useAvailabilityMasterData from '~/store/modules/useAvailabilityMasterData'
import CommonPage from '~/businessComponents/commonPage'
import CommonDrawer, { MODE } from '~/businessComponents/commonDrawer'
import { FormilyCommonJsonPretty } from '~/businessComponents/commonJsonPretty'
import Space from '~/basicComponents/space'
import PreviewModal from './components/previewModal'
import getFields from './fields'
import getSchema from './schema'
import styles from './index.module.scss'

import type { Field } from '@formily/core'
import type { IHistoryTaskResult } from '~/api/availabilityMonitoring/interfaces'
import type { ICommonObj } from '~/interfaces/common'
import type { ICommonEditorExpose } from '~/businessComponents/commonEditor'
import type { IExpose } from '~/businessComponents/commonPage'

export default defineComponent({
  name: 'TaskHistory',
  setup() {
    const route = useRoute()
    const timer = ref(-1)
    const commonPageRef = ref<IExpose>()
    const commonDrawerRef = ref<ICommonEditorExpose>()
    const editorSchema = ref({})
    const editorData = ref<Partial<IHistoryTaskResult>>({})
    const testId = computed(() => route.query.testId as string)
    const fields = computed(() => getFields())
    const masterDataStore = useAvailabilityMasterData()
    const formatListParams = (params: ICommonObj = {}) => {
      const [probeRegionName = '', probeSubdivision= ''] = params.node || []
      return {
        ...params,
        fromTime: params?.fromTime ? new Date(params.fromTime).toISOString() : '',
        toTime: params?.toTime ? new Date(params.toTime).toISOString() : '',
        testId: testId.value,
        probeRegionName,
        probeSubdivision,
        probeIspName: params.node?.isp,
      }
    }
    const openEditor = async ({ rowData }) => {
      try {
        editorData.value = await getHistoryTaskDetail({ testId: testId.value, resultId: rowData.resultId })
        commonDrawerRef.value?.open({ mode: MODE.VIEW, rowData: editorData.value, rowIndex: 0 })
        editorSchema.value = getSchema({
          protocol: route.query.requestType as Protocol,
          showFailReason: editorData.value?.basicData?.failCode !== 2,
          failSummary: editorData.value?.failSummary,
          isPassed: editorData.value?.basicData?.resultStatus === TaskResultStatus.PASSED,
          checkType: editorData.value.basicData.checkType,
        })
      } catch (error) {
        console.error(`获取历史任务详情失败，失败原因：${error}`)
      }
    }
    const init = async () => {
      try {
        await masterDataStore.getMonitoringNodes()
        await nextTick()
        const formRef = commonPageRef.value.getFilterForm()
        const node = formRef.query('space.grid.monitoringNodeName.void.node')?.take() as Field
        const isp = formRef.query('space.grid.monitoringNodeName.void.isp')?.take() as Field
        node.setDataSource(masterDataStore.masterData.monitoringNodes)
        isp.setDataSource(masterDataStore.masterData.monitoringIsps)
      } catch (error: any) {
        console.error(`初始化历史任务列表失败，失败原因：${error}`)
      }
    }
    init()
    const onClearInterval = () => {
      clearInterval(timer.value)
      timer.value = -1
    }
    watch(() => commonPageRef.value?.getPagination()?.page, (number) => {
      onClearInterval()
      if (number === 1) {
        timer.value = setInterval(() => {
          commonPageRef.value?.query()
        }, 30000) as unknown as number
      }
    }, { immediate: true })
    onUnmounted(() => {
      onClearInterval()
    })
    return () => (
      <>
        <CommonPage
          ref={commonPageRef}
          fields={fields.value}
          listApi={getTaskHistory}
          formatListParams={formatListParams}
          filterColumns={6}
          onRowClick={openEditor}
          needPagination
          refreshable
          resettable
        />
        <CommonDrawer
          bodyClass={styles.container}
          ref={commonDrawerRef}
          editFields={editorSchema.value}
          maxColumns={1}
          components={{ ElTag, PreviewModal, CommonJsonPretty: FormilyCommonJsonPretty }}
          v-slots={{
            title: () => (
              <Space align='end'>
                <el-tag type={taskResultStatusStyleMap[editorData.value?.basicData?.resultStatus]}>{taskResultStatusMap[editorData.value?.basicData?.resultStatus]}</el-tag>
                <el-text style={{ fontWeight: 'bold' }}>{editorData.value?.basicData?.monitoringNodeName}</el-text>
                <el-text size='small'>{editorData.value?.basicData?.execTime}</el-text>
              </Space>
            )
          }}
        />
      </>
    )
  }
})
