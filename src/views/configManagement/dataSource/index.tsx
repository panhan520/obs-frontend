import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { CommonPage } from '~/KeepUp/packages/businessComponents'
import {
  getDataSourceList,
  createDataSource,
  updateDataSource,
} from '~/api/configManagement/dataSource'
import { getListApi, createApi, editApi } from '~/api/domainManagement/inspectionWall'

import { getFields } from './fields'
import DataSourceTypeDialog from './components/SelectType/index'
import DataSourceDetailDrawer from './components/Detail'
import emitter from '~/utils/emitter'

import type { ICommonObj } from '~/interfaces/common'
import type { IExpose } from '~/KeepUp/packages/businessComponents/commonPage'
import type { DataSourceDetail } from '~/api/configManagement/dataSource/interfaces'

export default defineComponent({
  name: 'DataSource',
  setup() {
    const router = useRouter()
    const commonPageRef = ref<IExpose>()
    const fields = ref(getFields({ router, commonPageRef }))

    // 弹框和抽屉状态
    const showTypeDialog = ref(false)
    const showDetailDrawer = ref(false)
    const selectedDataSource = ref<DataSourceDetail | null>(null)

    const formatListParams = (params: ICommonObj) => {
      return {
        ...params,
      }
    }

    const handleCreate = () => {
      showTypeDialog.value = true
    }

    const handleTypeSelect = (typeId: string) => {
      router.push({
        path: 'dataSourceForm',
        query: { type: typeId },
      })
    }

    const handleShowDetail = (dataSource: DataSourceDetail) => {
      console.log(dataSource)
      selectedDataSource.value = dataSource
      showDetailDrawer.value = true
    }
    // 监听事件总线
    onMounted(() => {
      emitter.on('showDataSourceDetail', handleShowDetail)
    })

    onUnmounted(() => {
      emitter.off('showDataSourceDetail', handleShowDetail)
    })

    return () => (
      <div>
        <CommonPage
          ref={commonPageRef}
          fields={fields.value}
          listApi={getListApi}
          editApi={updateDataSource}
          formatListParams={formatListParams}
          pageKey='dataSource'
          filterColumns={5}
          rowKey='id'
          needPagination
          v-slots={{
            setterPrefix: () => (
              <>
                <ElButton type='primary' icon={Plus} onClick={handleCreate}>
                  新增
                </ElButton>
              </>
            ),
          }}
        />

        {/* 数据源类型选择弹框 */}
        <DataSourceTypeDialog
          modelValue={showTypeDialog}
          onUpdate:modelValue={(val: boolean) => {
            showTypeDialog.value = val
          }}
          onSelect={handleTypeSelect}
        />

        {/* 数据源详情抽屉 */}
        <DataSourceDetailDrawer
          modelValue={showDetailDrawer}
          onUpdate:modelValue={(val: boolean) => {
            showDetailDrawer.value = val
          }}
          dataSource={selectedDataSource.value}
        />
      </div>
    )
  },
})
