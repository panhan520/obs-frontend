import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CommonPage } from '~/businessComponents'
import { getListApi, createApi, editApi } from '~/api/domainManagement/inspectionWall'
import { hasPermission } from '~/utils/auth'
import { getFields } from './fields'

import type { ICommonObj } from '~/interfaces/common'
import type { IExpose } from '~/businessComponents/commonPage'

export default defineComponent({
  name: 'InspectionWall',
  setup() {
    const router = useRouter()
    const commonPageRef = ref<IExpose>()
    const fields = ref(getFields({ router, commonPageRef }))
    const formatListParams = (params: ICommonObj) => {
      return {
        ...params,
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
        pageKey='inspectionWall'
        filterColumns={5}
        editorLayout={{
          columns: 1,
          labelStyle: {
            margin: 0,
          },
        }}
        rowKey='id'
        needPagination
      />
    )
  },
})
