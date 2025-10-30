// components/DocumentView.tsx
import { defineComponent, PropType, ref, computed, watch } from 'vue'
import { LogDocument, LogField } from '@/api/logsPanel/discover/interfaces'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElTabs,
  ElTabPane,
  ElIcon,
  ElButton,
  ElTooltip,
} from 'element-plus'
import { ArrowDown, ArrowRight, CopyDocument, View, Filter } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import styles from '../index.module.scss'

export default defineComponent({
  name: 'DocumentView',
  props: {
    logDocuments: {
      type: Array as PropType<LogDocument[]>,
      required: true,
    },
    selectedFieldObjects: {
      type: Array as PropType<LogField[]>,
      required: true,
    },
    pagination: {
      type: Object as PropType<{
        page: number
        pageSize: number
        sortOrder: 'desc' | 'asc'
      }>,
      default: () => ({
        page: 1,
        pageSize: 50,
        sortOrder: 'desc' as 'desc' | 'asc',
      }),
    },
    total: {
      type: Number,
      required: true,
    },
  },
  emits: ['update:pagination'],
  setup(props, { emit }) {
    // 分页相关状态 - 使用父组件传入的值
    const currentPage = ref(props.pagination.page)
    const pageSize = ref(props.pagination.pageSize)
    const pageSizes = [10, 20, 50, 100]

    // 展开状态管理
    const expandedRows = ref<Set<string>>(new Set())
    const expandedDocumentTab = ref<'table' | 'json'>('table')

    // 排序状态 - 使用父组件传入的值
    const sortOrder = ref<'desc' | 'asc'>(props.pagination.sortOrder)

    // 排序后的数据（如需后端排序，这里可直接返回 props.logDocuments）
    const sortedDocuments = computed(() => {
      return [...props.logDocuments].sort((a, b) => {
        const timeA = new Date(a['timestamp']).getTime()
        const timeB = new Date(b['timestamp']).getTime()
        return sortOrder.value === 'desc' ? timeB - timeA : timeA - timeB
      })
    })

    // 同步父组件变更的分页（避免出现二次分页导致的数据错位）
    watch(
      () => props.pagination,
      (val) => {
        if (!val) return
        currentPage.value = val.page
        pageSize.value = val.pageSize
        sortOrder.value = val.sortOrder
      },
      { deep: true },
    )

    // 处理时间排序
    const handleTimeSort = (order: 'desc' | 'asc' | null) => {
      if (order) {
        sortOrder.value = order
        emitPaginationUpdate()
      }
    }

    // 发送分页参数更新事件
    const emitPaginationUpdate = () => {
      emit('update:pagination', {
        page: currentPage.value,
        pageSize: pageSize.value,
        sortOrder: sortOrder.value,
      })
    }

    // 监听分页参数变化
    watch([currentPage, pageSize, sortOrder], () => {
      emitPaginationUpdate()
    })

    // 切换行展开状态
    const toggleRowExpansion = (row: LogDocument) => {
      if (expandedRows.value.has(row._id)) {
        expandedRows.value.delete(row._id)
      } else {
        expandedRows.value.add(row._id)
      }
    }

    // 检查行是否展开
    const isRowExpanded = (rowId: string) => expandedRows.value.has(rowId)

    // 复制到剪贴板
    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        // 这里可以添加成功提示
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    // 格式化时间显示
    const formatTime = (timestamp: string | number) => {
      try {
        const timestampNum = Number(timestamp)

        if (isNaN(timestampNum) || timestampNum <= 0) {
          return String(timestamp)
        }

        return dayjs(timestampNum).format('YYYY-MM-DD HH:mm:ss')
      } catch {
        return String(timestamp)
      }
    }

    // 截断长文本
    const truncateText = (text: string, maxLength: number = 100) => {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    // 渲染 JSON 格式的源数据
    const renderSourceJson = (data: any) => {
      if (!data || typeof data !== 'object') {
        return <span class={styles.dashCell}>-</span>
      }

      const formatValue = (value: any): string => {
        if (value === null) return 'null'
        if (value === undefined) return 'undefined'
        if (typeof value === 'string') return `"${value}"`
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
      }

      const entries = Object.entries(data)
      return (
        <div class={styles.sourceJsonContainer}>
          {entries.map(([key, value], index) => (
            <span key={key} class={styles.sourceJsonItem}>
              <span class={styles.sourceJsonKey}>{key}:</span>
              <span class={styles.sourceJsonValue}>{formatValue(value)}</span>
              {index < entries.length - 1 && <span class={styles.sourceJsonSeparator}> </span>}
            </span>
          ))}
        </div>
      )
    }

    // 渲染展开内容
    const renderExpandedContent = (row: LogDocument) => (
      <div class={styles.expandedContent}>
        <ElTabs v-model={expandedDocumentTab.value} class={styles.expandedTabs}>
          <ElTabPane label='Table' name='table'>
            <div class={styles.documentTable}>
              {Object.entries(row).map(([key, value]) => (
                <div key={key} class={styles.documentRow}>
                  <div class={styles.documentKey}>{key}</div>
                  <div class={styles.documentValue}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </ElTabPane>
          <ElTabPane label='JSON' name='json'>
            <div class={styles.jsonContent}>
              <div class={styles.jsonHeader}>
                <ElButton
                  type='text'
                  size='small'
                  icon={CopyDocument}
                  onClick={() => copyToClipboard(JSON.stringify(row, null, 2))}
                >
                  复制
                </ElButton>
              </div>
              <pre class={styles.jsonPre}>{JSON.stringify(row, null, 2)}</pre>
            </div>
          </ElTabPane>
        </ElTabs>
      </div>
    )

    return () => (
      <div class={styles.documentView}>
        <div class={styles.logTableContainer}>
          <ElTable
            data={sortedDocuments.value}
            style='width: 100%'
            row-key='_id'
            expand-row-keys={Array.from(expandedRows.value)}
            onExpand={(row: LogDocument) => toggleRowExpansion(row)}
            expandIcon={({ expanded }: { expanded: boolean }) => (
              <ElIcon class={styles.expandIcon}>{expanded ? <ArrowDown /> : <ArrowRight />}</ElIcon>
            )}
          >
            <ElTableColumn
              type='expand'
              width={50}
              v-slots={{
                default: ({ row }: { row: LogDocument }) => renderExpandedContent(row),
              }}
            />
            <ElTableColumn
              prop='timestamp'
              label='Time'
              width={200}
              sortable='custom'
              sortOrders={['descending', 'ascending']}
              defaultSort={{ prop: 'timestamp', order: 'descending' }}
              onSortChange={(args: any) =>
                handleTimeSort(args.order === 'descending' ? 'desc' : 'asc')
              }
              v-slots={{
                default: ({ row }: { row: LogDocument }) => (
                  // <span class={styles.timeCell}>{formatTime(row['timestamp'])}</span>
                  <span class={styles.timeCell}>{row['timestamp']}</span>
                ),
              }}
            />
            {/* 动态渲染选中的字段列 */}
            {props.selectedFieldObjects.map((field) => {
              // 跳过 timestamp，因为已经单独处理了
              if (field.name === 'timestamp') return null

              return (
                <ElTableColumn
                  key={field.name}
                  prop={field.name}
                  label={field.name}
                  min-width={field.name === '_source' ? 300 : 150}
                  v-slots={{
                    default: ({ row }: { row: LogDocument }) => {
                      // 如果是 _source 字段，使用特殊的 JSON 渲染
                      if (field.name === '_source') {
                        return renderSourceJson(row)
                      }
                      const value = (row as any)[field.name]
                      if (value === undefined || value === null) {
                        return <span class={styles.dashCell}>-</span>
                      }
                      // 根据字段类型格式化显示
                      if (field.type === 'date') {
                        return <span class={styles.timeCell}>{formatTime(String(value))}</span>
                      } else if (field.type === 'number') {
                        return <span class={styles.numberCell}>{value}</span>
                      } else if (typeof value === 'object') {
                        return (
                          <span class={styles.messageCell}>
                            {truncateText(JSON.stringify(value), 100)}
                          </span>
                        )
                      } else {
                        return (
                          <span class={styles.textCell}>{truncateText(String(value), 100)}</span>
                        )
                      }
                    },
                  }}
                />
              )
            })}
          </ElTable>
        </div>

        <div class={styles.paginationContainer}>
          <ElPagination
            v-model:current-page={currentPage.value}
            v-model:page-size={pageSize.value}
            page-sizes={pageSizes}
            total={props.total}
            layout='total, sizes, prev, pager, next, jumper'
            background
          />
        </div>
      </div>
    )
  },
})
