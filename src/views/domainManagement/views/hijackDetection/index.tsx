import { defineComponent, ref, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'
import { CommonPage } from '~/businessComponents'
import { getListApi } from '~/api/domainManagement/hijackDetection'
import { hasPermission } from '~/utils/auth'
import { getFields } from './fields'

import type { ICommonObj } from '~/interfaces/common'
import type { IExpose } from '~/businessComponents/commonPage'

export default defineComponent({
  name: 'HijackDetection',
  setup() {
    const router = useRouter()
    const commonPageRef = ref<IExpose>()
    const fields = ref(getFields({ router, commonPageRef }))
    const formatListParams = (params: ICommonObj) => {
      return {
        page: params?.pagination?.page,
        pageSize: params?.pagination?.pageSize,
        search: params?.domain,
        inspectStatus: params?.inspectStatus,
      }
    }
    onMounted(() => {
      // localStorage.removeItem('hijackDetectionFilterParams')
      // localStorage.removeItem('hijackDetectionPagePreferences')
    })
    return () => (
      <CommonPage
        ref={commonPageRef}
        fields={fields.value}
        listApi={getListApi}
        formatListParams={formatListParams}
        pageKey='hijackDetection'
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
                disabled: !hasPermission(['domain:delete']),
                onClick: () => {
                  router.push({ name: 'HijackDetectionCreate' })
                },
              },
              '新增',
            ),
        }}
      />
    )
  },
})
