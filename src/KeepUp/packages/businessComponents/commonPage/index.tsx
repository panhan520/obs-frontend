import { defineComponent, ref, onMounted, onUnmounted, nextTick, provide } from 'vue'
import { ElDivider, ElButton, ElSpace } from 'element-plus'
import { ArrowDown, Refresh, Setting, Plus } from '@element-plus/icons-vue'
import Space from '../../basicComponents/space'
import emitter from '../../__builtins__/emitter'
import CommonFilter from '../commonFilter'
import CommonSetter from '../commonSetter'
import CommonTable from '../commonTable'
import CommonEditor from '../commonEditor'
import usePage from './usePage'
import { usePageActions } from './usePageActions'
import { useLayout } from './useLayout'
import { COMMON_FILTER_INJECTION_KEY } from './constants'
import styles from './index.module.scss'

import type { PropType, Ref, VNode } from 'vue'
import type { IListApi, ICommonObj } from '../../interfaces/common'
import type { IField } from '../../interfaces/commonPage'
import type { IExpose, IExpandedRowRenderParams } from './interfaces'
import type { ICommonFilterExpose } from '../commonFilter'
import type { ICommonEditorExpose, IEditorLayout } from '../commonEditor'
import type { ICommonTableExpose } from '../commonTable'

const ElDivider2 = ElDivider as any

const props = {
  /** fields */
  fields: {
    type: Array as PropType<IField[] | Ref<IField[]>>,
    default: () => ([]),
  },
  /** 获取列表 */
  listApi: {
    type: Function as PropType<IListApi>,
    default: undefined,
  },
  /** 创建 */
  createApi: {
    type: Function as PropType<(p: ICommonObj) => Promise<void>>,
    default: undefined,
  },
  /** 编辑 */
  editApi: {
    type: Function as PropType<(p: ICommonObj) => Promise<void>>,
    default: undefined,
  },
  /** 下载 */
  downloadApi: {
    type: Function as PropType<(p?: ICommonObj) => Promise<void>>,
    default: undefined,
  },
  /** 格式化列表接口入参 */
  formatListParams: {
    type: Function as PropType<(p: any) => any>,
    default: undefined,
  },
  /** 格式化创建&编辑接口入参 */
  formatEditParams: {
    type: Function as PropType<(p: any) => any>,
    default: undefined,
  },
  /** 页面标识 */
  pageKey: {
    type: String,
    default: '',
  },
  /** 行标识 */
  rowKey: {
    type: String,
    default: 'id',
  },
  /** 可选择 */
  selectable: {
    type: Boolean,
    default: false,
  },
  /** 选择配置 */
  selectOptions: {
    type: Function as PropType<(row?: any, index?: number) => boolean>,
    default: () => true,
  },
  /** 选中值 */
  selected: {
    type: Array,
    default: () => ([]),
  },
  /** 表格展开区域渲染器 */
  expandedRowRender: {
    type: Function as PropType<(p: IExpandedRowRenderParams) => VNode>,
    default: undefined,
  },
  /** 需要分页 */
  needPagination: {
    type: Boolean,
    default: false,
  },
  /** 分页配置 */
  paginationConfig: {
    type: Object,
    default: () => ({}),
  },
  /** 筛选区域栅格数量 */
  filterColumns: {
    type: Number,
    default: 3,
  },
  /** 编辑器样式 */
  editorLayout: {
    type: Object as PropType<IEditorLayout>,
    default: () => ({
      columns: 0,
      labelStyle: {
        width: '100px',
        margin: '0',
      }
    }),
  },
  /** 刷新 */
  refreshable: {
    type: Boolean,
    default: false,
  },
}

export * from './constants'
export * from '../commonEditor/constants'
export type { IField, IExpose }
export default defineComponent({
  name: 'CommonPage',
  props,
  setup(props, { emit, slots, expose }) {
    const containerRef = ref()
    const commonFilterRef = ref<ICommonFilterExpose>()
    const commonEditorRef = ref<ICommonEditorExpose>()
    const commonTableRef = ref<ICommonTableExpose>()
    const setterBarRef = ref()
    const extraPaneRef = ref()
    const { 
      allEditFields, 
      fetchEffects,
      visibleFilterFields, 
      visibleColumns,
      allVisibleFilterFields,
      allVisibleColumnFields,
      setPagePreferences,
    } = usePage(props) // 数据派生
    const {
      query,
      openEditor,
      create,
      filterReset,
      download,
      watchList,
    } = usePageActions(
      props.paginationConfig,
      props.downloadApi,
      commonFilterRef,
      commonEditorRef,
      commonTableRef,
    ) // 动作抽离
    watchList(ref([visibleColumns]))
    provide(COMMON_FILTER_INJECTION_KEY, commonFilterRef)
    const {
      commonTableRefHeight,
      updateTableHeight,
      watchLayout,
    } = useLayout(
      containerRef,
      commonFilterRef,
      setterBarRef,
      extraPaneRef,
    ) // ui副作用
    watchLayout([visibleFilterFields, visibleColumns])
    onMounted(async() => {
      emitter.on('openEditor', openEditor)
    })
    onUnmounted(() => {
      emitter.off('openEditor', openEditor)
    })
    expose<IExpose>({
      query,
      getFilterForm: () => commonFilterRef.value?.getForm(),
      getPagination: () => commonTableRef.value?.pagination,
      updateTableHeight,
    })
    return () => (
      <>
        <Space ref={containerRef} class={styles.container} direction='column'>
          <CommonFilter
            ref={commonFilterRef}
            class={styles.filterContainer}
            maxColumns={props.filterColumns}
            filterFields={visibleFilterFields.value}
            operateActions={{ query, reset: filterReset }}
            effectHooks={fetchEffects.value}
            pageKey={props.pageKey}
            v-slots={{
              ...(slots.filterTitle ? { title: slots.filterTitle } : {}),
            }}
          />
          <ElDivider2
            class={styles.collapse}
            onClick={async () => {
              if (!commonFilterRef.value?.collapseData?.collapsible) {
                return
              }
              commonFilterRef.value?.collapse()
              await nextTick()
              updateTableHeight()
            }}
            v-slots={{
              default: () => (
                commonFilterRef.value?.collapseData?.collapsible 
                  && <ElButton
                    class={styles.btn}
                    style={{ transform: `rotate(${commonFilterRef.value?.visible ? '180deg' : '0deg'})` }}
                    icon={ArrowDown}
                    link
                  />
              )
            }}
          />
          {slots?.extraPane && <div ref={extraPaneRef} class={styles.extraPane}>
            {slots.extraPane()}
          </div>}
          <Space ref={setterBarRef} class={styles.setter} justify='end'>
            <ElSpace>
              {props.createApi && <ElButton type='primary' icon={Plus} onClick={create}>新增</ElButton>}
              {slots.setterPrefix?.()}
              {props.downloadApi && (slots.download?.(download) || <ElButton onClick={download}>下载</ElButton>)}
            </ElSpace>
            <Space class={styles.end} fill justify='end'>
              {slots.setterSuffix?.()}
              {props.refreshable && <ElButton icon={Refresh} link onClick={() => query({ text: '刷新' })} />}
              {
                props.pageKey
                  && <CommonSetter
                    allVisibleFilterFields={allVisibleFilterFields}
                    allVisibleColumnFields={allVisibleColumnFields}
                    onConfirm={setPagePreferences}
                    v-slots={{
                      reference: () => (<ElButton icon={Setting} link />)
                    }}
                  />
              }
            </Space>
          </Space>
          <div class={styles.tableContainer}>
            <CommonTable
              ref={commonTableRef}
              rowKey={props.rowKey}
              height={commonTableRefHeight.value}
              columns={visibleColumns}
              listApi={props.listApi}
              formatListParams={props.formatListParams}
              beforeFetch={({ formData }) => { commonFilterRef.value?.keepFilter?.(formData) }}
              selectable={props.selectable}
              selectOptions={props.selectOptions}
              selected={props.selected}
              expandedRowRender={props.expandedRowRender}
              onUpdate:selected={(val: any[]) => { emit('update:selected', val) }}
              needPagination={props.needPagination}
              onRowClick={(row: any, column: any, event: Event) => { emit('rowClick', { rowData: row, column, event }) }}
            />
          </div>
        </Space>
        <CommonEditor
          ref={commonEditorRef}
          createApi={props.createApi}
          editApi={props.editApi}
          editFields={allEditFields.value}
          layout={props.editorLayout}
          effectHooks={fetchEffects.value}
          formatEditParams={props.formatEditParams}
          onConfirmSuccess={() => { query({ page: commonTableRef.value.pagination?.page }) }}
        />
      </>
    )
  }
})
