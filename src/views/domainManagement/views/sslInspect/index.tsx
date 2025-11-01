import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CommonPage } from '~/businessComponents'
import { getListApi, createApi, editApi } from '~/api/domainManagement/sslInspect'
import { hasPermission } from '~/utils/auth'
import { getFields } from './fields'

import type { ICommonObj } from '~/interfaces/common'
import type { IExpose } from '~/businessComponents/commonPage'

export default defineComponent({
  name: 'SslInspect',
  setup() {
    const router = useRouter()
    const commonPageRef = ref<IExpose>()
    const fields = ref(getFields({ router, commonPageRef }))
    const formatListParams = (params: ICommonObj) => {
      return {
        page: params?.pagination?.page,
        pageSize: params?.pagination?.pageSize,
        search: params?.domain,
        startDate: params?.fromTime,
        endDate: params?.toTime,
      }
    }
    return () => (
      <CommonPage
        ref={commonPageRef}
        fields={fields.value}
        listApi={getListApi}
        createApi={createApi}
        disabledAdd={!hasPermission(['domain:post'])}
        editApi={editApi}
        formatListParams={formatListParams}
        pageKey='sslInspect'
        filterColumns={6}
        rowKey='id'
        refreshable
        needPagination
      />
    )
  },
})
