import { defineComponent, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { isEmpty } from 'lodash'
import { getHistoryNodeListApi, getHistoryListApi } from '~/api/domainManagement/dnsInspect'
import Space from '~/basicComponents/space'
import CommonTable from '~/businessComponents/commonTable'
import CommonPage from '~/businessComponents/commonPage'
import { fields, historyFields } from './fields'

import type { ICommonTableExpose } from '~/businessComponents/commonTable'
import type { ICommonObj } from '@/interfaces/common'

export default defineComponent({
  name: 'View',
  setup() {
    const route = useRoute()
    const commonTableRef = ref<ICommonTableExpose>()
    const activeRowData = ref<ICommonObj>({})
    const formatListParams = (params: ICommonObj) => {
      return { 
        ...params, 
        ...(isEmpty(activeRowData.value) ? {} : { nodeName: `${activeRowData.value.nodeName}${activeRowData.value.ispName}` }), 
        task: route.query?.id,
      }
    }
    const rowClick = async ({ rowData }) => {
      activeRowData.value = rowData
      await nextTick()
      commonTableRef.value?.getList()
    }
    return () => (
      <Space direction='row' fill style={{ padding: '16px', boxSizing: 'border-box' }}>
        <div style={{ width: '50%', height: '100%', flexShrink: 0 }}>
          <CommonPage
            fields={fields}
            listApi={getHistoryNodeListApi}
            onRowClick={rowClick}
          />
        </div>
        <div style={{ width: '50%', height: '100%', backgroundColor: '#fff' }}>
          <CommonTable
            height='calc(100vh - 161px)'
            ref={commonTableRef}
            columns={historyFields}
            listApi={getHistoryListApi}
            formatListParams={formatListParams}
            needPagination
          />
        </div>
      </Space>
    )
  }
})
