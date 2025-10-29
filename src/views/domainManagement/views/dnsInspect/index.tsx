import { defineComponent, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'
import { CommonPage } from '~/businessComponents'
import { getListApi } from '~/api/domainManagement/dnsInspect'
import { getFields } from './fields'

import type { ICommonObj } from '~/interfaces/common'
import type { IExpose } from '~/businessComponents/commonPage'

export default defineComponent({
  name: 'DnsInspect',
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
        formatListParams={formatListParams}
        pageKey='dnsInspect'
        filterColumns={6}
        rowKey='id'
        refreshable
        needPagination
        v-slots={{
          setterPrefix: () =>
            h(
              ElButton,
              {
                type: 'primary',
                onClick: () => {
                  router.push({ name: 'DnsInspectCreate' })
                },
              },
              '新增',
            ),
        }}
      />
    )
  },
})
