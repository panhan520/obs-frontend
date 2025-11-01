import { defineComponent, ref } from 'vue'
import { CommonPage, CommonModal, CommonTable } from '~/businessComponents'
import { getListApi, editApi, getRecordApi } from '~/api/domainManagement/checkResults'
import { getFields } from './fields'
import { columns } from './constants'

import type { ICommonObj } from '~/interfaces/common'
import type { IExpose } from '~/businessComponents/commonPage'
import type { ICommonModalExpose } from '~/businessComponents/commonModal'
import { hasPermission } from '~/utils/auth'

export default defineComponent({
  name: 'CheckResults',
  setup() {
    const commonPageRef = ref<IExpose>()
    const commonModalRef = ref<ICommonModalExpose>()
    const fields = ref(getFields({ commonModalRef }))
    const formatListParams = (params: ICommonObj) => {
      return {
        ...params,
      }
    }
    const formatEditParams = (params: ICommonObj) => {
      return {
        oldDomain: params.domain,
        newDomain: params.newDomain,
      }
    }
    return () => (
      <>
        <CommonPage
          ref={commonPageRef}
          fields={fields.value}
          listApi={getListApi}
          editApi={editApi}
          disabledAdd={!hasPermission(['domain:post'])}
          formatListParams={formatListParams}
          formatEditParams={formatEditParams}
          pageKey='checkResults'
          filterColumns={5}
          rowKey='id'
          refreshable
          needPagination
        />
        <CommonModal
          ref={commonModalRef}
          size='70%'
          title='替换记录'
          v-slots={{
            default: () => <CommonTable columns={columns} listApi={getRecordApi} needPagination />,
          }}
        />
      </>
    )
  },
})
