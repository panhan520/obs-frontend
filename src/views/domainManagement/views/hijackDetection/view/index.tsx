import { defineComponent, ref, nextTick, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { isEmpty } from 'lodash'
import { getHistoryNodeListApi, getHistoryListApi } from '~/api/domainManagement/hijackDetection'
import Space from '~/basicComponents/space'
import CommonTable from '~/businessComponents/commonTable'
import CommonPage from '~/businessComponents/commonPage'
import CommonFilter, { type ICommonFilterExpose } from '~/businessComponents/commonFilter'
import type { IExpose, IQueryParams } from '~/businessComponents/commonPage/interfaces'
import usePage from '~/businessComponents/commonPage/usePage'
import { fields, historyFields } from './fields'

import type { ICommonTableExpose } from '~/businessComponents/commonTable'
import type { ICommonObj } from '@/interfaces/common'

export default defineComponent({
  name: 'View',
  setup() {
    const route = useRoute()
    const commonTableRef = ref<ICommonTableExpose>()
    const activeRowData = ref<ICommonObj>({})
    const rowClick = async ({ rowData }) => {
      activeRowData.value = rowData
      await nextTick()
      commonTableRef.value?.getList()
    }

    const commonFilterRef = ref<ICommonFilterExpose>()
    const { allFilterFields, fetchEffects } = usePage({
      fields: historyFields,
      pageKey: 'hijackDetectionView',
    })

    /** 查询 */
    const query = async ({ page, text }: IQueryParams = {}) => {
      await commonTableRef.value?.getList(page || 1, 10, '查询')
    }
    /** 重置筛选条件 */
    const filterReset = () => {
      commonFilterRef.value?.reset()
      commonPageRef.value?.updateTableHeight?.()
      query({ text: '重置' })
    }
    /**更改组件传参 */
    const formatListParamsRight = (params: ICommonObj) => {
      return {
        ...commonFilterRef.value?.getForm().values,
        page: params?.pagination?.page,
        pageSize: params?.pagination?.pageSize,
        ...(isEmpty(activeRowData.value)
          ? {}
          : { nodeName: `${activeRowData.value.nodeName}${activeRowData.value.ispName}` }),
        task: route.query?.id,
      }
    }
    const commonPageRef = ref()

    onActivated(async () => {
      await nextTick()
      // 主动刷新左边的 CommonPage 数据
      commonPageRef.value?.query?.()
    })

    return () => (
      <Space direction='column' fill size={1} style={{ padding: '16px', boxSizing: 'border-box' }}>
        <div
          style={{
            width: '100%',
            backgroundColor: '#fff',
            flexShrink: 0,
          }}
        >
          <CommonFilter
            style={{ padding: '16px' }}
            ref={commonFilterRef}
            filterFields={allFilterFields.value}
            operateActions={{ query, reset: filterReset }}
            effectHooks={fetchEffects.value}
            pageKey='hijackDetectionView'
          />
        </div>
        <Space direction='row' fill style={{ flex: 1 }}>
          <div style={{ width: '30%', height: '100%' }}>
            <CommonPage
              fields={fields}
              listApi={getHistoryNodeListApi}
              filterColumns={2}
              onRowClick={rowClick}
            />
          </div>
          <div style={{ width: '70%', height: '100%', backgroundColor: '#fff' }}>
            <CommonTable
              tableLayout='fixed'
              ref={commonTableRef}
              columns={historyFields}
              listApi={getHistoryListApi}
              formatListParams={formatListParamsRight}
              needPagination
            />
          </div>
        </Space>
      </Space>
    )
  },
})
