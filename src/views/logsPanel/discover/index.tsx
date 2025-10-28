// LogSearchView.tsx
import { defineComponent, ref, computed, onMounted } from 'vue'
import { ElSelect, ElOption, ElInput, ElIcon, ElButton, ElDialog, ElDrawer } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getIndexList, getQueryConds, getLogHistogram, getLogList } from '@/api/logsPanel/discover'
import { getDataSourceList } from '@/api/configManagement/dataSource'
import {
  LogField,
  LogDocument,
  logChartData,
  FilterCondition,
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
    // 数据源
    const dataSourceList = ref<string[]>(['categraf-index-logs*'])
    const dataSourceId = ref<number>(1)
    // 索引
    const indexList = ref<string[]>(['categraf-index-logs*'])
    const indexName = ref<string>('categraf-index-logs*')
    // 筛选字段（前端控制）
    const searchField = ref('')
    // 搜索条件（查询语句）
    const searchQuery = ref('')
    const showFilterDialog = ref(false)
    // 视图管理状态
    type SavedView = {
      id: string
      title: string
      createdAt: number
      payload: {
        dataSource: string[]
        index: string
        searchQuery: string
        timeRange: { start: string | null; end: string | null }
      }
    }
    const viewsKey = 'obs.discover.savedViews'
    const activeViewId = ref<string | null>(null)
    const activeViewTitle = ref<string>('')
    const showSaveDialog = ref(false)
    const saveTitle = ref('')
    const showOpenDrawer = ref(false)
    const viewSearch = ref('')
    const savedViews = ref<SavedView[]>([])
    const timeRange = ref<{ start: string | null; end: string | null }>({ start: null, end: null })

    const loadViews = () => {
      try {
        const raw = localStorage.getItem(viewsKey)
        savedViews.value = raw ? (JSON.parse(raw) as SavedView[]) : []
      } catch {
        savedViews.value = []
      }
    }
    const persistViews = () => {
      localStorage.setItem(viewsKey, JSON.stringify(savedViews.value))
    }
    const resetToNewView = () => {
      activeViewId.value = null
      activeViewTitle.value = ''
      saveTitle.value = ''
    }
    const handleNew = () => {
      resetToNewView()
      // 清空查询与时间范围但保留索引选择
      searchQuery.value = ''
      timeRange.value = { start: null, end: null }
    }
    const handleSave = () => {
      saveTitle.value = activeViewTitle.value || ''
      showSaveDialog.value = true
    }
    const confirmSave = () => {
      const id = activeViewId.value ?? `view_${Date.now()}`
      const now = Date.now()
      const view: SavedView = {
        id,
        title: saveTitle.value || 'Untitled',
        createdAt: activeViewId.value
          ? savedViews.value.find((v) => v.id === id)?.createdAt ?? now
          : now,
        payload: {
          dataSource: indexList.value,
          index: indexName.value,
          searchQuery: searchQuery.value,
          timeRange: timeRange.value,
        },
      }
      const idx = savedViews.value.findIndex((v) => v.id === id)
      if (idx >= 0) savedViews.value[idx] = view
      else savedViews.value.unshift(view)
      persistViews()
      activeViewId.value = id
      activeViewTitle.value = view.title
      showSaveDialog.value = false
    }
    const handleOpen = () => {
      loadViews()
      viewSearch.value = ''
      showOpenDrawer.value = true
    }
    const filteredViews = computed(() => {
      const q = viewSearch.value.trim().toLowerCase()
      if (!q) return savedViews.value
      return savedViews.value.filter((v) => v.title.toLowerCase().includes(q))
    })
    const openView = (v: SavedView) => {
      activeViewId.value = v.id
      activeViewTitle.value = v.title
      indexName.value = v.payload.index
      searchQuery.value = v.payload.searchQuery
      timeRange.value = v.payload.timeRange
      showOpenDrawer.value = false
    }

    // 字段数据
    const availableFields = ref<LogField[]>([
      { name: '_id', type: 'string', selected: false },
      { name: '_index', type: 'string', selected: false },
      { name: '_score', type: 'number', selected: false },
      { name: '_type', type: 'string', selected: false },
      { name: '@timestamp', type: 'date', selected: false },
      { name: '_source', type: 'object', selected: false, isSystemField: true }, // 系统字段，不可手动删除
      { name: 'agent_hostname', type: 'string', selected: false },
      { name: 'business.amount', type: 'number', selected: false },
      { name: 'business.currency', type: 'string', selected: false },
      { name: 'business.current_stock', type: 'number', selected: false },
      { name: 'business.customer', type: 'string', selected: false },
      { name: 'business.order_id', type: 'string', selected: false },
      { name: 'business.payment_method', type: 'string', selected: false },
      { name: 'business.product_id', type: 'string', selected: false },
    ])

    const filterConditions = ref<FilterCondition[]>([])

    // 示例日志数据
    const logDocuments = ref<LogDocument[]>([])
    const logChartDatas = ref<logChartData[]>([
      { time: '2025-10-08 00:00:00', level: 'error', count: '3' },
      { time: '2025-10-08 00:00:00', level: 'info', count: '3' },
      { time: '2025-10-08 00:00:00', level: 'warn', count: '3' },
      { time: '2025-10-09 00:00:00', level: 'warn', count: '2' },
      { time: '2025-10-09 00:00:00', level: 'info', count: '1' },
      { time: '2025-10-09 00:00:00', level: 'error', count: '1' },
      { time: '2025-10-10 00:00:00', level: 'warn', count: '2' },
      { time: '2025-10-12 00:00:00', level: 'info', count: '1' },
      { time: '2025-10-11 00:00:00', level: 'error', count: '1' },
    ])

    const currentDocument = ref(logDocuments.value[0])

    // 计算属性
    const selectedFields = computed(() =>
      availableFields.value.filter((field) => field.selected).map((field) => field.name),
    )
    // Status counts based on example data. In real use, compute from response.
    const statusChecked = ref<StatusKey[]>(['Error', 'Warn', 'Info'])
    const statusCounts = computed<Record<StatusKey, number>>(() => {
      // 假计数：可根据 logDocuments 实际字段统计，比如 level 或 status
      const counts: Record<StatusKey, number> = { Error: 0, Warn: 0, Info: 0 }
      logDocuments.value.forEach((d) => {
        const level = (d as any).level as string | undefined
        if (!level) return
        const key = (level[0].toUpperCase() + level.slice(1)) as StatusKey
        if (counts[key] !== undefined) counts[key]++
      })
      return counts
    })

    const filteredDocuments = computed(() => {
      // 根据勾选的状态过滤日志文档
      return logDocuments.value.filter((d) => {
        const level = (d as any).level as string | undefined
        if (!level) return true
        const key = (level[0].toUpperCase() + level.slice(1)) as StatusKey
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
      // 如果是系统字段（如 _source），不允许手动切换
      if (field.isSystemField) {
        return
      }

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
    const executeSearch = async (queryData: any) => {
      console.log('查询数据:', queryData)
      const params = {
        ...queryData,
        dataSourceId: dataSourceId.value,
        indexName: indexName.value,
        filterConditions: filterConditions.value,
      }
      const resCharts = await getLogHistogram(params)
      const res = await getLogList(params)
    }

    const addFilterCondition = (filter: FilterCondition) => {
      filterConditions.value.push(filter)
    }
    // 打开添加过滤条件弹框
    const handleAddFilter = () => {
      showFilterDialog.value = true
    }
    // 处理日志数据，将 logJson 字符串转换为对象
    const transformLogData = (data: LogDocument[]) => {
      return data.map((item) => {
        try {
          // 解析 logJson 字符串
          const logData = JSON.parse(item.logJson)

          // 创建新对象，包含 timestamp 和所有解析后的字段
          return {
            timestamp: item.timestamp,
            ...logData,
          }
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
      const res = await getDataSourceList({})
      // dataSourceList.value = res
      console.log('获取数据源列表数据', res)
    }
    // 获取索引列表数据
    const getIndexListData = async () => {
      const res = await getIndexList({ dataSourceId: dataSourceId.value })
      indexList.value = res.data.details
      console.log('获取索引列表数据', res)
    }
    // 查询保存的检索条件列表
    const getQueryCondsData = async () => {
      const res = await getQueryConds()
      console.log('获取查询条件数据', res)
    }
    onMounted(() => {
      getDataSourceListData()
      getIndexListData()
      getQueryCondsData()
      loadViews()
      // 模拟数据
      const res = [
        {
          timestamp: '2025-10-08 00:00:00',
          logJson:
            '{"_id": "kih0pZkBkhra2IgY05Tt8","_index": "categraf-index-logs","_score": 1,"_type": "_doc","@timestamp": "Oct 2, 2025 @ 22:16:45.456","agent_hostname": "server-02","event": "disk_space_warning","fcservice": "monitoring","fcsource": "system_monitor","fctags": { "filename": "system.log"},"system.disk_usage": "90%", "system.threshold": "85%","system.path": "/var/log","topic": "system-log","msg_key": "SYS123456789", "level": "error"}',
        },
        {
          timestamp: '2025-10-08 00:00:00',
          logJson:
            '{"_id": "kih0pZkBkhra2IgY05Tt2","_index": "categraf-index-logs","_score": 1.0,"_type": "_doc","@timestamp": "Oct 2, 2025 @ 21:30:15.123","agent_hostname": "server-01","event": "user_login","fcservice": "auth_service","fcsource": "web_app","fctags": { "filename": "auth.log"},"user.id": "12345","user.name": "john_doe","topic": "auth-log","msg_key": "AUTH123456789","level": "info"}',
        },
        {
          timestamp: '2025-10-08 00:00:00',
          logJson:
            '{"_id": "kih0pZkBkhra2IgY05Tt3","_index": "categraf-index-logs","_score": 1.0,"_type": "_doc","@timestamp": "Oct 2, 2025 @ 20:45:30.456","agent_hostname": "server-02","event": "high_memory_usage","fcservice": "monitoring","fcsource": "system_monitor","fctags": { "filename": "system.log"},"system.memory_usage": "85%","system.threshold": "80%","topic": "system-log","msg_key": "SYS987654321","level": "warn"}',
        },
      ]
      logDocuments.value = transformLogData(res)
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
                  v-model={dataSourceId.value}
                  class={styles.indexSelect}
                  placeholder='选择数据源'
                >
                  {dataSourceList.value.map((it) => (
                    <ElOption label={it} value={it} />
                  ))}
                </ElSelect>
                <ElButton
                  onClick={() => {
                    getDataSourceListData()
                  }}
                >
                  <ElIcon>
                    <Refresh />
                  </ElIcon>
                </ElButton>
              </div>
            </div>
            {/* 选择索引 */}
            <div class={styles.panelSection}>
              <div class={styles.indexSelectRow}>
                <ElSelect
                  v-model={indexName.value}
                  class={styles.indexSelect}
                  placeholder='选择索引'
                >
                  {indexList.value.map((it) => (
                    <ElOption label={it} value={it} />
                  ))}
                </ElSelect>
                <ElButton
                  onClick={() => {
                    getIndexListData()
                  }}
                >
                  <ElIcon>
                    <Refresh />
                  </ElIcon>
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
            <FieldPanel
              title='Available fields'
              fields={availableFieldObjects.value}
              onFieldToggle={toggleFieldSelection}
            />
          </div>
          {/* 右侧面板 */}
          <div class={styles.rightContent}>
            {/* 搜索栏 */}
            <SearchHeader
              searchQuery={searchQuery.value}
              availableFields={availableFields.value}
              initialTimeRange={timeRange.value}
              filterConditions={filterConditions.value}
              onUpdate:searchQuery={(value) => (searchQuery.value = value)}
              onSearch={executeSearch}
              onAddFilter={handleAddFilter}
              onRemoveFilter={(index: number) => {
                filterConditions.value.splice(index, 1)
              }}
              onTimeRangeUpdate={(tr: { start: string | null; end: string | null }) =>
                (timeRange.value = tr)
              }
              onPredefinedTimeSelect={(data: { minutes: number; start: string; end: string }) => {
                console.log('Predefined time selected:', data)
                // 这里可以将分钟数发送给后端
              }}
            />
            {/* 动态柱状图 */}
            <LogChart logChartData={logChartDatas.value} selectedStatuses={statusChecked.value} />
            {/* 搜索结果 */}
            <DocumentView
              logDocuments={filteredDocuments.value}
              selectedFieldObjects={selectedFieldObjects.value}
            />
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
                <ElButton type='primary' disabled={!saveTitle.value.trim()} onClick={confirmSave}>
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
            <ElInput placeholder='搜索...' v-model={viewSearch.value} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredViews.value.map((v) => (
              <div class={styles.viewItem} onClick={() => openView(v)}>
                <ElIcon style={{ marginRight: '6px' }}>
                  <Search />
                </ElIcon>
                <span>{v.title}</span>
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
