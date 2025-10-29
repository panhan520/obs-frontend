// LogSearchView.tsx
import { defineComponent, ref, computed, onMounted, reactive } from 'vue'
import {
  ElSelect,
  ElOption,
  ElInput,
  ElIcon,
  ElButton,
  ElDialog,
  ElDrawer,
  ElMessage,
} from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import {
  getIndexList,
  getQueryConds,
  getLogHistogram,
  getLogList,
  setQueryConds,
} from '@/api/logsPanel/discover'
import { getDatasourceUseList } from '@/api/configManagement/dataSource'
import {
  LogField,
  LogDocument,
  logChartData,
  FilterCondition,
  SavedView,
} from '@/api/logsPanel/discover/interfaces'
import SearchHeader from './components/SearchHeader'
import FieldPanel from './components/FieldPanel'
import DocumentView from './components/DocumentView'
import FilterDialog from './components/FilterDialog'
import StatusFilter, { type StatusKey } from './components/StatusFilter'
import LogChart from './components/LogChart/index'
import styles from './index.module.scss'

export default defineComponent({
  name: 'LogSearchView',
  setup() {
    // 统一的检索条件状态管理
    const searchConditions = reactive({
      // 数据源和索引
      dataSourceId: '',
      indexName: '',

      // 搜索条件
      queryCondition: '',
      filterConditions: [] as FilterCondition[],

      // 时间范围
      timeRange: {
        start: null as string | null,
        end: null as string | null,
      },
      startTimestamp: null as number | null,
      endTimestamp: null as number | null,
      searchTimeType: 1 as 1 | 2, // 1: 绝对时间, 2: 相对时间
      minutesPast: undefined as number | undefined,

      // 分页参数
      page: 1,
      pageSize: 50,
      sortOrder: 'desc' as 'desc' | 'asc',
    })

    // 初始化时间范围，与子组件SearchHeader保持一致（过去15分钟到现在）
    const now = new Date()
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)

    // 设置初始时间范围
    searchConditions.timeRange = {
      start: fifteenMinutesAgo.toISOString(),
      end: now.toISOString(),
    }
    searchConditions.startTimestamp = fifteenMinutesAgo.getTime()
    searchConditions.endTimestamp = now.getTime()

    // 其他状态
    const dataSourceList = ref([])
    const indexList = ref([])
    const searchField = ref('')
    const showFilterDialog = ref(false)

    // 视图管理状态
    const activeViewId = ref<string | null>(null)
    const activeViewTitle = ref<string>('')
    const showSaveDialog = ref(false)
    const saveTitle = ref('')
    const showOpenDrawer = ref(false)
    const viewSearch = ref('')
    const savedViews = ref<SavedView[]>([])

    const loadViews = async () => {
      try {
        const res = await getQueryConds()
        savedViews.value = res.data.views || []
      } catch (error) {
        console.error('加载保存的视图失败:', error)
        savedViews.value = []
      }
    }
    const resetToNewView = () => {
      activeViewId.value = null
      activeViewTitle.value = ''
      saveTitle.value = ''
    }
    const handleNew = () => {
      resetToNewView()
      // 清空查询与时间范围但保留索引选择
      searchConditions.queryCondition = ''
      searchConditions.filterConditions = []
      searchConditions.timeRange = { start: null, end: null }
      searchConditions.startTimestamp = null
      searchConditions.endTimestamp = null
      searchConditions.searchTimeType = 1
      searchConditions.minutesPast = undefined
    }
    const handleSave = () => {
      saveTitle.value = activeViewTitle.value || ''
      showSaveDialog.value = true
    }
    const confirmSave = async () => {
      try {
        const params = {
          searchName: saveTitle.value,
          dataSourceId: searchConditions.dataSourceId,
          indexName: searchConditions.indexName,
          queryCondition: searchConditions.queryCondition,
          filterConditions: searchConditions.filterConditions,
          startTimestamp: searchConditions.startTimestamp ?? undefined,
          endTimestamp: searchConditions.endTimestamp ?? undefined,
          searchTimeType:
            searchConditions.searchTimeType === 2
              ? 'SEARCH_TIME_TYPE_RELATIVE'
              : 'SEARCH_TIME_TYPE_ABSOLUTE',
          minutesPast: searchConditions.minutesPast,
        }
        saveViewLoading.value = true
        await setQueryConds(params)
        ElMessage.success('保存成功')

        // 重新加载视图列表
        await loadViews()

        // 设置当前活动视图
        const savedView = savedViews.value.find((v) => v.searchName === saveTitle.value)
        if (savedView) {
          activeViewId.value = savedView.searchName
          activeViewTitle.value = savedView.searchName
        }

        showSaveDialog.value = false
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      } finally {
        saveViewLoading.value = false
      }
    }
    const handleOpen = async () => {
      await loadViews()
      viewSearch.value = ''
      showOpenDrawer.value = true
    }
    const filteredViews = computed(() => {
      const q = viewSearch.value.trim().toLowerCase()
      if (!q) return savedViews.value
      return savedViews.value.filter((v) => v.searchName.toLowerCase().includes(q))
    })
    const openView = (v: SavedView) => {
      activeViewId.value = v.searchName
      activeViewTitle.value = v.searchName

      // 更新所有检索条件
      searchConditions.dataSourceId = v.dataSourceId
      searchConditions.indexName = v.indexName
      searchConditions.queryCondition = v.queryCondition
      searchConditions.filterConditions = v.filterConditions || []
      searchConditions.minutesPast = v.minutesPast

      if (v.startTimestamp) {
        searchConditions.startTimestamp = Date.parse(v.startTimestamp)
        searchConditions.timeRange.start = new Date(v.startTimestamp).toISOString()
      }
      if (v.endTimestamp) {
        searchConditions.endTimestamp = Date.parse(v.endTimestamp)
        searchConditions.timeRange.end = new Date(v.endTimestamp).toISOString()
      }

      showOpenDrawer.value = false
    }

    // 字段数据 - 初始化为空，将从API动态获取
    const availableFields = ref<LogField[]>([])

    // 示例日志数据
    const logDocuments = ref<LogDocument[]>([])
    const logChartDatas = ref<logChartData[]>([])

    const currentDocument = ref(logDocuments.value[0])

    // Loading状态
    const dataSourceLoading = ref(false)
    const indexListLoading = ref(false)
    const loading = ref(false)
    const chartLoading = ref(false)
    const fieldsLoading = ref(false)
    const saveViewLoading = ref(false)

    // 处理分页参数变化
    const handlePaginationUpdate = (params: {
      page: number
      pageSize: number
      sortOrder: 'desc' | 'asc'
    }) => {
      searchConditions.page = params.page
      searchConditions.pageSize = params.pageSize
      searchConditions.sortOrder = params.sortOrder
      console.log('分页参数更新:', params)
      // 这里可以触发重新查询数据
      // executeSearch({ ...searchQuery.value, ...timeRange.value })
    }

    // 计算属性
    const selectedFields = computed(() =>
      availableFields.value.filter((field) => field.selected).map((field) => field.name),
    )
    // Status counts based on example data. In real use, compute from response.
    const statusChecked = ref<StatusKey[]>(['Error', 'Warn', 'Info'])
    const statusCounts = computed<Record<StatusKey, number>>(() => {
      // 假计数：可根据 logDocuments 实际字段统计，比如 level 或 status
      const counts: Record<StatusKey, number> = { Error: 0, Warn: 0, Info: 0 }
      logChartDatas.value.forEach((d) => {
        const level = (d as any).level as string | undefined
        if (!level) return

        // 处理后端返回的全大写格式，如 ERROR, WARN, INFO
        const normalizedLevel = level.toUpperCase()
        let key: StatusKey

        if (normalizedLevel === 'ERROR') key = 'Error'
        else if (normalizedLevel === 'WARN') key = 'Warn'
        else if (normalizedLevel === 'INFO') key = 'Info'
        else {
          // 如果不是标准格式，尝试首字母大写
          key = (level[0].toUpperCase() + level.slice(1).toLowerCase()) as StatusKey
        }

        if (counts[key] !== undefined) counts[key]++
      })
      return counts
    })

    const filteredDocuments = computed(() => {
      // 根据勾选的状态过滤日志文档
      return logChartDatas.value.filter((d) => {
        const level = (d as any).level as string | undefined
        if (!level) return true

        // 处理后端返回的全大写格式
        const normalizedLevel = level.toUpperCase()
        let key: StatusKey

        if (normalizedLevel === 'ERROR') key = 'Error'
        else if (normalizedLevel === 'WARN') key = 'Warn'
        else if (normalizedLevel === 'INFO') key = 'Info'
        else {
          key = (level[0].toUpperCase() + level.slice(1).toLowerCase()) as StatusKey
        }

        return statusChecked.value.includes(key)
      })
    })

    const selectedFieldObjects = computed(() => {
      const selectedFields = availableFields.value.filter((field) => field.selected)

      // 如果没有选中任何字段，默认显示 _source 字段
      if (selectedFields.length === 0) {
        const sourceField = availableFields.value.find((field) => field.name === '_source')
        if (sourceField) {
          // 检查搜索条件，如果 _source 字段名不匹配搜索条件，则不显示
          if (searchField.value.trim()) {
            const searchTerm = searchField.value.trim().toLowerCase()
            if (sourceField.name.toLowerCase().includes(searchTerm)) {
              return [sourceField]
            } else {
              return [] // 不匹配搜索条件，返回空数组
            }
          }
          return [sourceField]
        }
      }

      // 根据搜索字段进行过滤
      if (searchField.value.trim()) {
        const searchTerm = searchField.value.trim().toLowerCase()
        return selectedFields.filter((field) => field.name.toLowerCase().includes(searchTerm))
      }

      return selectedFields
    })

    const availableFieldObjects = computed(() => {
      const unselectedFields = availableFields.value.filter((field) => !field.selected)

      // 根据搜索字段进行过滤
      if (searchField.value.trim()) {
        const searchTerm = searchField.value.trim().toLowerCase()
        return unselectedFields.filter((field) => field.name.toLowerCase().includes(searchTerm))
      }

      return unselectedFields
    })

    // 方法
    const toggleFieldSelection = (field: LogField) => {
      field.selected = !field.selected

      // 如果选中了其他字段，自动取消 _source 字段的选中状态
      if (field.selected) {
        const sourceField = availableFields.value.find((f) => f.name === '_source')
        if (sourceField && sourceField.selected) {
          sourceField.selected = false
        }
      }
    }

    // 处理查询数据
    const executeSearch = (queryData: any) => {
      if (!searchConditions.dataSourceId) {
        ElMessage.warning('请选择数据源')
        return
      }
      if (!searchConditions.indexName) {
        ElMessage.warning('请选择索引')
        return
      }
      // 同步查询数据到统一状态
      if (queryData) {
        if (typeof queryData.queryCondition !== 'undefined') {
          searchConditions.queryCondition = queryData.queryCondition
        }
        if (typeof queryData.searchTimeType !== 'undefined') {
          searchConditions.searchTimeType = queryData.searchTimeType
        }
        if (typeof queryData.startTimestamp !== 'undefined') {
          searchConditions.startTimestamp = queryData.startTimestamp
        }
        if (typeof queryData.endTimestamp !== 'undefined') {
          searchConditions.endTimestamp = queryData.endTimestamp
        }
        if (typeof queryData.minutesPast !== 'undefined') {
          searchConditions.minutesPast = queryData.minutesPast
        }
      }

      const normalizedSearchTimeType =
        searchConditions.searchTimeType === 2
          ? 'SEARCH_TIME_TYPE_RELATIVE'
          : 'SEARCH_TIME_TYPE_ABSOLUTE'

      let params: any = {
        dataSourceId: searchConditions.dataSourceId,
        indexName: searchConditions.indexName,
        filterConditions: searchConditions.filterConditions,
        queryCondition: searchConditions.queryCondition,
        searchTimeType: normalizedSearchTimeType,
      }

      if (normalizedSearchTimeType === 'SEARCH_TIME_TYPE_RELATIVE') {
        if (typeof searchConditions.minutesPast !== 'undefined') {
          params.minutesPast = searchConditions.minutesPast
        }
      } else {
        if (typeof searchConditions.startTimestamp !== 'undefined') {
          params.startTimestamp = searchConditions.startTimestamp
        }
        if (typeof searchConditions.endTimestamp !== 'undefined') {
          params.endTimestamp = searchConditions.endTimestamp
        }
      }
      getChartData(params)
      params = {
        ...params,
        page: searchConditions.page,
        pageSize: searchConditions.pageSize,
        sortOrder: searchConditions.sortOrder === 'asc' ? 'SORT_ORDER_ASC' : 'SORT_ORDER_DESC',
      }
      getList(params)
    }
    // 获取图表数据
    const getChartData = async (params) => {
      try {
        chartLoading.value = true
        const resCharts = await getLogHistogram(params)
        logChartDatas.value = resCharts.data.histogram
      } finally {
        chartLoading.value = false
      }
    }
    // 获取日志列表
    const getList = async (params) => {
      try {
        loading.value = true
        fieldsLoading.value = true
        const res = await getLogList(params)
        const logList = res.data.list as LogDocument[]
        logDocuments.value = transformLogData(logList)

        // 从第一个日志条目的logJson动态解析字段
        if (logList && logList.length > 0) {
          const firstLog = logList[0]
          if (firstLog && firstLog.logJson) {
            const parsedFields = parseFieldsFromLogJson(firstLog.logJson)
            availableFields.value = parsedFields
          }
        }
      } finally {
        loading.value = false
        fieldsLoading.value = false
      }
    }

    const addFilterCondition = (filter: FilterCondition) => {
      searchConditions.filterConditions.push(filter)
    }
    // 打开添加过滤条件弹框
    const handleAddFilter = () => {
      showFilterDialog.value = true
    }
    // 从logJson动态解析字段
    const parseFieldsFromLogJson = (logJson: string) => {
      try {
        const logData = JSON.parse(logJson)
        const fields: LogField[] = []

        // 递归解析 logData 中的字段
        const parseObjectFields = (obj: any, prefix = '') => {
          // 如果存在 _source，则拍平到当前对象
          if (obj && typeof obj === 'object' && obj._source && typeof obj._source === 'object') {
            Object.assign(obj, obj._source) // 将 _source 的字段展开到 obj
            // delete obj._source // 删除原来的 _source 字段
          }

          Object.keys(obj).forEach((key) => {
            const fullKey = prefix ? `${prefix}.${key}` : key
            const value = obj[key]
            let type = 'string'

            if (value === null) {
              type = 'string'
            } else if (typeof value === 'number') {
              type = 'number'
            } else if (typeof value === 'boolean') {
              type = 'boolean'
            } else if (value instanceof Date) {
              type = 'date'
            } else if (typeof value === 'object' && value !== null) {
              type = 'object'
              // 递归处理嵌套对象
              parseObjectFields(value, fullKey)
            } else if (typeof value === 'string') {
              // 尝试判断是否为日期字符串
              if (key.toLowerCase().includes('time') || key.toLowerCase().includes('date')) {
                type = 'date'
              } else {
                type = 'string'
              }
            }

            // 避免重复添加字段
            if (!fields.some((f) => f.name === fullKey)) {
              fields.push({
                name: fullKey,
                type,
                selected: false,
              })
            }
          })
        }

        parseObjectFields(logData)
        return fields
      } catch (error) {
        console.error('解析logJson失败:', error)
        return []
      }
    }

    // 处理日志数据，将 logJson 字符串转换为对象
    const transformLogData = (data: LogDocument[]) => {
      return data.map((item) => {
        try {
          // 解析 logJson 字符串
          const logData = JSON.parse(item.logJson)

          // 创建新对象，包含 timestamp 和所有解析后的字段
          const result = {
            timestamp: item.timestamp,
            ...logData,
          }

          // 如果存在 _source 字段，将其内容拍平到第一层级
          if (logData._source && typeof logData._source === 'object') {
            // 将 _source 中的字段添加到第一层级
            Object.keys(logData._source).forEach((key) => {
              result[key] = logData._source[key]
            })
          }
          delete result._source

          return result
        } catch (error) {
          console.error('解析 JSON 失败:', error)
          // 如果解析失败，返回原始数据
          return {
            timestamp: item.timestamp,
            logJson: item.logJson,
            parseError: true,
          }
        }
      })
    }
    // 获取数据源列表
    const getDataSourceListData = async () => {
      try {
        dataSourceLoading.value = true
        const res = await getDatasourceUseList()
        dataSourceList.value = res.data.list
        if (res.data.list.length) {
          searchConditions.dataSourceId = res.data.list[0].id
          getIndexListData(res.data.list[0].id)
        }
      } finally {
        dataSourceLoading.value = false
      }
    }
    // 获取索引列表数据
    const getIndexListData = async (value?: string) => {
      try {
        indexListLoading.value = true
        const res = await getIndexList({ dataSourceId: value })
        indexList.value = res.data.list
      } finally {
        indexListLoading.value = false
      }
    }
    // 处理数据源切换
    const handleDataSourceChange = async (selectedId: string) => {
      if (!selectedId) return
      searchConditions.dataSourceId = selectedId
      getIndexListData(selectedId)
    }
    onMounted(() => {
      getDataSourceListData()
    })

    return () => (
      <div class={styles.logSearchContainer}>
        {/* 视图管理栏：新建/保存/打开 */}
        <div class={styles.viewBar}>
          <div class={styles.viewLeft}>
            <span class={styles.viewBadge}>{activeViewId.value ? '已打开' : '视图'}</span>
            {activeViewTitle.value ? (
              <span class={styles.viewTitle}>{activeViewTitle.value}</span>
            ) : null}
          </div>
          <div class={styles.viewActions}>
            <ElButton size='small' onClick={handleNew}>
              新建
            </ElButton>
            <ElButton size='small' type='primary' onClick={handleSave}>
              保存
            </ElButton>
            <ElButton size='small' onClick={handleOpen}>
              打开
            </ElButton>
          </div>
        </div>
        <div class={styles.mainContent}>
          {/* 左侧面板 */}
          <div class={styles.leftPanel}>
            {/* 选择数据源 */}
            <div class={styles.panelSection}>
              <div class={styles.indexSelectRow}>
                <ElSelect
                  v-model={searchConditions.dataSourceId}
                  class={styles.indexSelect}
                  placeholder='选择数据源'
                  loading={dataSourceLoading.value}
                  disabled={dataSourceLoading.value}
                  onChange={handleDataSourceChange} // 添加 change 事件
                >
                  {dataSourceList.value.map((it) => (
                    <ElOption label={it.name} value={it.id} />
                  ))}
                </ElSelect>
                <ElButton
                  onClick={() => {
                    getDataSourceListData()
                  }}
                  loading={dataSourceLoading.value}
                >
                  {dataSourceLoading.value ? (
                    ''
                  ) : (
                    <ElIcon>
                      <Refresh />
                    </ElIcon>
                  )}
                </ElButton>
              </div>
            </div>
            {/* 选择索引 */}
            <div class={styles.panelSection}>
              <div class={styles.indexSelectRow}>
                <ElSelect
                  v-model={searchConditions.indexName}
                  class={styles.indexSelect}
                  placeholder='选择索引'
                  loading={indexListLoading.value}
                  disabled={indexListLoading.value}
                >
                  {indexList.value.map((it) => (
                    <ElOption label={it.indexName} value={it.indexName} />
                  ))}
                </ElSelect>
                <ElButton
                  loading={indexListLoading.value}
                  onClick={() => {
                    getIndexListData()
                  }}
                >
                  {indexListLoading.value ? (
                    ''
                  ) : (
                    <ElIcon>
                      <Refresh />
                    </ElIcon>
                  )}
                </ElButton>
              </div>
            </div>
            {/* 筛选字段 */}
            <div class={styles.panelSection}>
              <ElInput
                placeholder='搜索字段名称'
                class={styles.searchInput}
                v-model={searchField.value}
                clearable
              >
                {{
                  prefix: () => (
                    <ElIcon>
                      <Search />
                    </ElIcon>
                  ),
                }}
              </ElInput>
            </div>
            {/* 已选中的字段 */}
            <FieldPanel
              title='Selected fields'
              fields={selectedFieldObjects.value}
              showSelected={true}
              onFieldToggle={toggleFieldSelection}
            />
            {/* 状态过滤器 */}
            <StatusFilter
              modelValue={statusChecked.value}
              counts={statusCounts.value}
              onUpdate:modelValue={(v: StatusKey[]) => (statusChecked.value = v)}
            />
            {/* 可选字段 */}
            <div v-loading={fieldsLoading.value}>
              <FieldPanel
                title='Available fields'
                fields={availableFieldObjects.value}
                onFieldToggle={toggleFieldSelection}
              />
            </div>
          </div>
          {/* 右侧面板 */}
          <div class={styles.rightContent}>
            {/* 搜索栏 */}
            <SearchHeader
              searchQuery={searchConditions.queryCondition}
              availableFields={availableFields.value}
              timeRange={searchConditions.timeRange}
              startTimestamp={searchConditions.startTimestamp}
              endTimestamp={searchConditions.endTimestamp}
              searchTimeType={searchConditions.searchTimeType}
              minutesPast={searchConditions.minutesPast}
              filterConditions={searchConditions.filterConditions}
              onUpdate:searchQuery={(value) => {
                searchConditions.queryCondition = value
              }}
              onSearch={executeSearch}
              onAddFilter={handleAddFilter}
              onRemoveFilter={(index: number) => {
                searchConditions.filterConditions.splice(index, 1)
              }}
              onUpdate:timeRange={(tr: { start: string | null; end: string | null }) => {
                searchConditions.timeRange = tr
              }}
              onUpdate:startTimestamp={(timestamp: number) => {
                searchConditions.startTimestamp = timestamp
              }}
              onUpdate:endTimestamp={(timestamp: number) => {
                searchConditions.endTimestamp = timestamp
              }}
              onUpdate:searchTimeType={(type: 1 | 2) => {
                searchConditions.searchTimeType = type
              }}
              onUpdate:minutesPast={(minutes: number | undefined) => {
                searchConditions.minutesPast = minutes
              }}
            />
            {/* 动态柱状图 */}
            <div v-loading={chartLoading.value}>
              <LogChart logChartData={logChartDatas.value} selectedStatuses={statusChecked.value} />
            </div>
            {/* 搜索结果 */}
            {logDocuments.value.length > 0 && (
              <div v-loading={loading.value}>
                <DocumentView
                  logDocuments={logDocuments.value}
                  selectedFieldObjects={selectedFieldObjects.value}
                  pagination={{
                    page: searchConditions.page,
                    pageSize: searchConditions.pageSize,
                    sortOrder: searchConditions.sortOrder,
                  }}
                  onUpdate:pagination={handlePaginationUpdate}
                />
              </div>
            )}
          </div>
        </div>

        {/* 保存对话框 */}
        <ElDialog
          modelValue={showSaveDialog.value}
          title='保存检索视图'
          width='480px'
          onUpdate:modelValue={(v: boolean) => (showSaveDialog.value = v)}
          v-slots={{
            footer: () => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <ElButton onClick={() => (showSaveDialog.value = false)}>取消</ElButton>
                <ElButton
                  type='primary'
                  disabled={!saveTitle.value.trim()}
                  onClick={confirmSave}
                  loading={saveViewLoading.value}
                >
                  保存
                </ElButton>
              </div>
            ),
          }}
        >
          <div style={{ marginBottom: '12px', color: '#606266' }}>
            保存您的检索视图，以便在可视化和仪表板中使用它
          </div>
          <ElInput placeholder='请输入标题' v-model={saveTitle.value} />
        </ElDialog>

        {/* 打开抽屉 */}
        <ElDrawer
          modelValue={showOpenDrawer.value}
          title='打开检索视图'
          size='40%'
          withHeader
          onUpdate:modelValue={(v: boolean) => (showOpenDrawer.value = v)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ElInput placeholder='搜索...' v-model={viewSearch.value} clearable />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredViews.value.map((v) => (
              <div class={styles.viewItem} onClick={() => openView(v)}>
                <ElIcon style={{ marginRight: '6px' }}>
                  <Search />
                </ElIcon>
                <span>{v.searchName}</span>
              </div>
            ))}
          </div>
        </ElDrawer>
        <FilterDialog
          modelValue={showFilterDialog.value}
          availableFields={availableFields.value}
          currentDocument={currentDocument.value}
          onUpdate:modelValue={(value) => (showFilterDialog.value = value)}
          onAddFilter={addFilterCondition}
        />
      </div>
    )
  },
})
