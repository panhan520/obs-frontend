import { defineComponent, onMounted, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import Space from '~/basicComponents/space'
import CommonTable from '~/businessComponents/commonTable'
import { IExpose } from '~/businessComponents/commonPage/interfaces'
import type { ICommonTableExpose } from '~/businessComponents/commonTable'
import AddIndex from './component/addIndex'
import styles from './index.module.scss'
import {
  ElMessage,
  ElSelect,
  ElOption,
  ElButton,
  ElMessageBox,
  type DrawerProps,
} from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getFields } from './fields'
import { FormItem, Options } from './type'
import { getIndexApi, getDatasourceApi, deleteIndexApi } from '~/api/logsPanel'
import type { ICommonObj } from '@/interfaces/common'
export default defineComponent({
  name: 'IndexManagement',
  setup() {
    onMounted(() => {
      getDatasource()
    })
    const router = useRouter()
    const getDatasource = async () => {
      const res = await getDatasourceApi()
      options.value = res.data.list
    }
    // 索引的选择源
    const formInline = ref<FormItem>({
      dataSourceId: '',
      keyword: '',
    })
    const options = ref<Array<Options>>([])
    /**table传参自定义参数源 */

    const formatListParamsRight = (params: ICommonObj) => {
      return {
        ...params,
        ...formInline.value,
        // page: params?.pagination?.page,
        // pageSize: params?.pagination?.pageSize,
      }
    }

    /**新增索引 */
    const commonTableRef = ref<ICommonTableExpose>()
    /**搜索 */
    const onSubmit = () => {
      commonTableRef?.value?.getList()
    }
    const dialogRef = ref()
    const fields = ref([
      ...getFields({ router, commonTableRef }),
      {
        prop: 'operation',
        label: '操作',
        fixed: 'right',
        isColumn: true,
        render({ rowData }) {
          const isEnable = rowData?.taskStatus
          return h(
            Space,
            {
              size: 0,
              justify: 'start',
            },
            [
              h(
                ElButton,
                {
                  type: 'danger',
                  link: true,
                  onClick: async (e: Event) => {
                    try {
                      e.stopPropagation()
                      await ElMessageBox.confirm('确认删除当前任务?', {
                        confirmButtonText: '确认',
                        cancelButtonText: '取消',
                        type: 'warning',
                      })
                      await deleteIndexApi({ indexId: rowData.indexId })
                      ElMessage({
                        message: `删除成功`,
                        type: 'success',
                      })
                      commonTableRef?.value?.getList()
                    } catch (error: any) {
                      console.log(`取消刪除`)
                    }
                  },
                },
                '删除',
              ),
              h(
                ElButton,
                {
                  type: 'primary',
                  link: true,
                  disabled: true,
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    dialogRef.value?.showDialog(rowData)
                  },
                },
                '编辑',
              ),
            ],
          )
        },
      },
    ])
    return () => (
      <>
        <Space class={styles.container} direction='column' fill size={0} justify='align'>
          <Space direction='row' fill>
            <div class={styles.customSelectWrapper}>
              <div class={styles.prefix}>看板</div>
              <ElSelect
                v-model={formInline.value.dataSourceId}
                placeholder='请选择'
                class={styles.customSelect}
                onChange={onSubmit}
              >
                {options.value.map((item) => (
                  <ElOption label={item.name} value={item.id} />
                ))}
              </ElSelect>
            </div>
            <el-input
              v-model={formInline.value.keyword}
              placeholder='请输入索引名称'
              clearable
              v-slots={{
                prepend: <el-button icon={Search} onClick={onSubmit} />,
              }}
              onKeyup={(e) => e.key === 'Enter' && onSubmit()}
            />
          </Space>
          <Space direction='row' fill size={0} justify='end' style={{ padding: '16px 0' }}>
            <el-button type='primary' onClick={() => dialogRef.value?.showDialog()}>
              新增索引
            </el-button>
          </Space>
          <CommonTable
            ref={commonTableRef}
            columns={fields}
            listApi={getIndexApi}
            formatListParams={formatListParamsRight}
            needPagination
            pageKey='indexManegementTable'
            v-slots={{
              empty: () =>
                h(
                  'span',
                  formInline.value.dataSourceId ? '暂无数据' : '请先选择看板里的数据源筛选条件',
                ),
            }}
          />
        </Space>
        <AddIndex
          ref={dialogRef}
          options={options.value}
          onGetList={() => commonTableRef.value?.getList()}
        ></AddIndex>
      </>
    )
  },
})
