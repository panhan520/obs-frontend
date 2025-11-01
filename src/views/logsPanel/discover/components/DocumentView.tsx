// components/DocumentView.tsx
import { defineComponent, PropType, ref, watch } from 'vue'
import { LogDocument, LogField } from '@/api/logsPanel/discover/interfaces'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElTabs,
  ElTabPane,
  ElIcon,
  ElButton,
} from 'element-plus'
import { ArrowDown, ArrowUp, CopyDocument } from '@element-plus/icons-vue'
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
    searchKey: {
      type: String,
      default: '',
    },
    isStreaming: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:pagination'],
  setup(props, { emit }) {
    const currentPage = ref(props.pagination.page)
    const pageSize = ref(props.pagination.pageSize)
    const pageSizes = [10, 20, 50, 100]
    const expandedRows = ref<Set<string>>(new Set())
    const expandedDocumentTab = ref<'table' | 'json'>('table')

    watch(
      () => props.pagination,
      (val) => {
        if (!val) return
        currentPage.value = val.page
        pageSize.value = val.pageSize
      },
      { deep: true },
    )

    const getRowId = (row: LogDocument): string => {
      return row._id || (row as any).id || String(row.timestamp)
    }

    const toggleRowExpansion = (row: LogDocument) => {
      const rowId = getRowId(row)
      if (expandedRows.value.has(rowId)) {
        expandedRows.value.delete(rowId)
      } else {
        expandedRows.value.add(rowId)
      }
    }

    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    const truncateText = (text: string, maxLength: number = 100) => {
      if (!text) return '-'
      return text.length <= maxLength ? text : text.substring(0, maxLength) + '...'
    }

    // 高亮显示搜索关键字
    const highlightText = (text: string, searchKey: string) => {
      if (!searchKey || !text) {
        return text || ''
      }

      const keyStr = String(searchKey)
      const textStr = String(text)

      // 使用正则表达式进行全局替换（不区分大小写）
      const regex = new RegExp(`(${keyStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      const parts = textStr.split(regex)

      return (
        <>
          {parts.map((part, index) => {
            if (part.toLowerCase() === keyStr.toLowerCase()) {
              return (
                <span key={index} style={{ backgroundColor: '#ffff00', fontWeight: 'bold' }}>
                  {part}
                </span>
              )
            }
            return <span key={index}>{part}</span>
          })}
        </>
      )
    }

    const renderSourceJson = (data: any) => {
      if (!data || typeof data !== 'object') {
        return <span class={styles.dashCell}>-</span>
      }
      const entries = Object.entries(data)
      return (
        <div class={styles.sourceJsonContainer}>
          {entries.map(([key, value], index) => (
            <span key={key} class={styles.sourceJsonItem}>
              <span class={styles.sourceJsonKey}>{highlightText(key, props.searchKey)}:</span>
              <span class={styles.sourceJsonValue}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
              {index < entries.length - 1 && <span class={styles.sourceJsonSeparator}> </span>}
            </span>
          ))}
        </div>
      )
    }

    const renderExpandedContent = (row: LogDocument) => (
      <div class={styles.expandedContent}>
        <ElTabs v-model={expandedDocumentTab.value} class={styles.expandedTabs}>
          <ElTabPane label='Table' name='table'>
            <div class={styles.documentTable}>
              {Object.entries(row).map(([key, value]) => (
                <div key={key} class={styles.documentRow}>
                  <div class={styles.documentKey}>{highlightText(key, props.searchKey)}</div>
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

    /**
     * 只允许两态排序（时间 asc/desc）
     */
    const currentSortOrder = ref<'asc' | 'desc'>(props.pagination.sortOrder)

    const handleSortChange = () => {
      // 手动切换排序状态
      currentSortOrder.value = currentSortOrder.value === 'desc' ? 'asc' : 'desc'

      emit('update:pagination', {
        page: 1,
        pageSize: pageSize.value,
        sortOrder: currentSortOrder.value,
      })
    }

    watch([currentPage, pageSize], () => {
      emit('update:pagination', {
        page: currentPage.value,
        pageSize: pageSize.value,
        sortOrder: currentSortOrder.value,
      })
    })

    return () => (
      <div class={styles.documentView}>
        <div class={styles.logTableContainer}>
          <ElTable
            data={props.logDocuments}
            style='width: 100%'
            row-key='_id'
            onExpand={(row: LogDocument) => toggleRowExpansion(row)}
          >
            <ElTableColumn
              type='expand'
              width={50}
              v-slots={{
                default: ({ row }: { row: LogDocument }) => renderExpandedContent(row),
              }}
            />

            {/* 只允许时间字段排序 */}
            <ElTableColumn
              prop='timestamp'
              label='Time'
              width={200}
              sortable={false}
              v-slots={{
                header: () => (
                  <div
                    class={styles.sortHeader}
                    style='cursor:pointer; display:flex; align-items:center;'
                    onClick={handleSortChange}
                  >
                    <span>Time</span>
                    <ElIcon style='margin-left:6px;'>
                      {currentSortOrder.value === 'desc' ? <ArrowDown /> : <ArrowUp />}
                    </ElIcon>
                  </div>
                ),
                default: ({ row }: { row: LogDocument }) => (
                  <span class={styles.timeCell}>{row['timestamp']}</span>
                ),
              }}
            />

            {props.selectedFieldObjects.map((field) => {
              if (field.name === 'timestamp') return null
              return (
                <ElTableColumn
                  key={field.name}
                  prop={field.name}
                  label={field.name}
                  min-width={field.name === '_source' ? 300 : 150}
                  v-slots={{
                    default: ({ row }: { row: LogDocument }) => {
                      const value = (row as any)[field.name]
                      if (field.name === '_source') return renderSourceJson(row)
                      if (value === undefined || value === null)
                        return <span class={styles.dashCell}>-</span>
                      if (typeof value === 'object') {
                        const jsonStr = JSON.stringify(value)
                        const truncated = truncateText(jsonStr, 100)
                        return <span class={styles.messageCell}>{truncated}</span>
                      }
                      const textValue = truncateText(String(value), 100)
                      return <span class={styles.textCell}>{textValue}</span>
                    },
                  }}
                />
              )
            })}
          </ElTable>
        </div>

        {!props.isStreaming && (
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
        )}
      </div>
    )
  },
})
