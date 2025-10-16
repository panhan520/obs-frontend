import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CommonPage } from '~/businessComponents'
import { getListApi, createApi, editApi } from '~/api/domainManagement/inspectionPollution'
import { getFields } from './fields'

import type { ICommonObj } from '~/interfaces/common'
import type { IExpose } from '~/businessComponents/commonPage'

export default defineComponent({
  name: 'InspectionPollution',
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
        editApi={editApi}
        formatListParams={formatListParams}
        pageKey='inspectionPollution'
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
