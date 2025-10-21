// components/DocumentView.tsx
import { defineComponent, PropType, ref, computed } from 'vue'
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
  },
  setup(props) {
    // 分页相关状态
    const currentPage = ref(1)
    const pageSize = ref(50)
    const pageSizes = [10, 20, 50, 100]

    // 展开状态管理
    const expandedRows = ref<Set<string>>(new Set())
    const expandedDocumentTab = ref<'table' | 'json'>('table')

    // 排序状态
    const sortOrder = ref<'desc' | 'asc'>('desc') // 默认按时间降序（最新在前）

    // 排序后的数据
    const sortedDocuments = computed(() => {
      return [...props.logDocuments].sort((a, b) => {
        const timeA = new Date(a['@timestamp']).getTime()
        const timeB = new Date(b['@timestamp']).getTime()
        return sortOrder.value === 'desc' ? timeB - timeA : timeA - timeB
      })
    })

    // 计算分页数据
    const paginatedDocuments = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return sortedDocuments.value.slice(start, end)
    })

    // 总页数
    const totalPages = computed(() => Math.ceil(props.logDocuments.length / pageSize.value))

    // 处理时间排序
    const handleTimeSort = (order: 'desc' | 'asc' | null) => {
      if (order) {
        sortOrder.value = order
      }
    }

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
    const formatTime = (timestamp: string) => {
      try {
        const date = new Date(timestamp)
        return date.toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      } catch {
        return timestamp
      }
    }

    // 截断长文本
    const truncateText = (text: string, maxLength: number = 100) => {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    // 渲染展开内容
    const renderExpandedContent = (row: LogDocument) => (
      <div class={styles.expandedContent}>
        <ElTabs v-model={expandedDocumentTab.value} class={styles.expandedTabs}>
          <ElTabPane label='Table' name='table'>
            <div class={styles.documentTable}>
              {Object.entries(row).map(([key, value]) => (
                <div key={key} class={styles.documentRow}>
                  <div class={styles.documentKey}>
                    <span class={styles.keyIcon}>t</span>
                    {key}
                  </div>
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
            data={paginatedDocuments.value}
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
              prop='@timestamp'
              label='Time'
              width={200}
              sortable='custom'
              sortOrders={['descending', 'ascending']}
              defaultSort={{ prop: '@timestamp', order: 'descending' }}
              onSortChange={(args: any) =>
                handleTimeSort(args.order === 'descending' ? 'desc' : 'asc')
              }
              v-slots={{
                default: ({ row }: { row: LogDocument }) => (
                  <span class={styles.timeCell}>{formatTime(row['@timestamp'])}</span>
                ),
              }}
            />
            {/* 动态渲染选中的字段列 */}
            {props.selectedFieldObjects.map((field) => {
              // 跳过 @timestamp，因为已经单独处理了
              if (field.name === '@timestamp') return null

              return (
                <ElTableColumn
                  key={field.name}
                  prop={field.name}
                  label={field.name}
                  min-width={150}
                  v-slots={{
                    default: ({ row }: { row: LogDocument }) => {
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
            total={props.logDocuments.length}
            layout='total, sizes, prev, pager, next, jumper'
            background
          />
        </div>
      </div>
    )
  },
})
