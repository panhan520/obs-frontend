import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import styles from '../index.module.scss'

import CommonTable from '~/businessComponents/commonTable'
import { getRecordApi } from '~/api/domainManagement/inspectionWall'
import fields from './fields'
import type { ICommonObj } from '~/interfaces/common'

export default defineComponent({
  name: 'InspectionWallLog',
  setup() {
    const route = useRoute()
    const activeName = ref('1')
    const formatListParams = (params: ICommonObj) => {
      return {
        ...params,
        task: route.query.id,
      }
    }
    return () => (
      <el-tabs modelValue={activeName} class={styles.container}>
        <el-tab-pane label='历史快照' name='1'>
          <CommonTable
            columns={fields}
            listApi={getRecordApi}
            formatListParams={formatListParams}
            needPagination
          />
        </el-tab-pane>
      </el-tabs>
    )
  },
})
