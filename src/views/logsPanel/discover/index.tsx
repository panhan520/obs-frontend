// LogSearchView.tsx
import { defineComponent, ref, computed, onMounted, onUnmounted, reactive } from 'vue'
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
import { Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import {
  getIndexList,
  getQueryConds,
  getLogHistogram,
  getLogList,
  setQueryConds,
  createLogStream,
  editQueryConds,
  deleteQueryConds,
  getIndexLogList,
} from '@/api/logsPanel/discover'
import { hasPermission } from '~/utils/auth'
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
      indexId: null,
      indexName: '',

      // 搜索条件
      queryCondition: '',
      filterConditions: [] as FilterCondition[],
      levels: [] as string[], // 日志级别筛选

      // 时间范围
      startTimestamp: null as number | null,
      endTimestamp: null as number | null,
      searchTimeType: 1 as 1 | 2, // 1: 绝对时间, 2: 相对时间
      minutesPast: undefined as number | undefined,

      // 分页参数
      page: 1,
      pageSize: 50,
      sortOrder: 'desc' as 'desc' | 'asc',
    })
    // 数据源列表总数
    const total = ref(0)

    // 初始化时间范围，与子组件SearchHeader保持一致（过去15分钟到现在）
    const now = new Date()
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)

    // 设置初始时间范围
    searchConditions.startTimestamp = fifteenMinutesAgo.getTime()
    searchConditions.endTimestamp = now.getTime()
    searchConditions.minutesPast = 15

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
    // 编辑/删除视图
    const editDialogVisible = ref(false)
    const editViewName = ref('')
    const editTargetId = ref<number | null>(null)
    const editLoading = ref(false)
    const deleteDialogVisible = ref(false)
    const deleteTargetId = ref<number | null>(null)
    const deleteLoading = ref(false)

    const isHasIndexList = ref<any>(false)
    const loadViews = async () => {
      try {
        openViewListLoading.value = true
        const res = await getQueryConds()
        savedViews.value = res.data.views || []
      } catch (error) {
        console.error('加载保存的视图失败:', error)
        savedViews.value = []
      } finally {
        openViewListLoading.value = false
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
      searchConditions.startTimestamp = fifteenMinutesAgo.getTime()
      searchConditions.endTimestamp = now.getTime()
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
        saveViewLoading.value = true
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
      viewSearch.value = ''
      showOpenDrawer.value = true
      await loadViews()
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
        searchConditions.startTimestamp = Number(v.startTimestamp)
      }
      if (v.endTimestamp) {
        searchConditions.endTimestamp = Number(v.endTimestamp)
      }
      if (v.dataSourceId) {
        getIndexListData(v.dataSourceId)
      }

      showOpenDrawer.value = false
    }

    // 触发编辑
    const handleEditView = (v: SavedView) => {
      editTargetId.value = v.id
      editViewName.value = v.searchName || ''
      editDialogVisible.value = true
    }
    // 提交编辑
    const confirmEditView = async () => {
      if (!editTargetId.value || !editViewName.value.trim()) return
      try {
        editLoading.value = true
        await editQueryConds({ id: editTargetId.value, searchName: editViewName.value.trim() })
        await loadViews()
        // 如果当前活动视图就是被编辑的，更新标题
        if (activeViewId.value === activeViewTitle.value) {
          activeViewTitle.value = editViewName.value.trim()
        }
        editDialogVisible.value = false
        ElMessage.success('修改成功')
      } catch (e) {
        ElMessage.error('修改失败')
      } finally {
        editLoading.value = false
      }
    }

    // 触发删除
    const handleDeleteView = (v: SavedView) => {
      deleteTargetId.value = v.id
      deleteDialogVisible.value = true
    }
    // 确认删除
    const confirmDeleteView = async () => {
      if (!deleteTargetId.value) return
      try {
        deleteLoading.value = true
        await deleteQueryConds(deleteTargetId.value)
        await loadViews()
        // 如果删除当前活动视图，重置
        if (activeViewId.value && savedViews.value.every((sv) => sv.id !== deleteTargetId.value)) {
          activeViewId.value = null
          activeViewTitle.value = ''
        }
        deleteDialogVisible.value = false
        ElMessage.success('删除成功')
      } catch (e) {
        ElMessage.error('删除失败')
      } finally {
        deleteLoading.value = false
      }
    }

    // 字段数据 - 初始化为空，将从API动态获取
    const availableFields = ref<LogField[]>([])

    // 示例日志数据
    const logDocuments = ref<any[]>([])
    const logChartDatas = ref<logChartData[]>([])

    const currentDocument = ref(logDocuments.value[0])

    // Loading状态
    const dataSourceLoading = ref(false)
    const indexListLoading = ref(false)
    const loading = ref(false)
    const chartLoading = ref(false)
    const fieldsLoading = ref(false)
    const saveViewLoading = ref(false)
    const openViewListLoading = ref(false)

    // SSE连接状态
    const isStreaming = ref(false)
    const logStream = ref<EventSource | null>(null)

    // 搜索关键字（只在查询后生效）
    const searchKey = ref('')

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
      const normalizedSearchTimeType =
        searchConditions.searchTimeType === 2
          ? 'SEARCH_TIME_TYPE_RELATIVE'
          : 'SEARCH_TIME_TYPE_ABSOLUTE'

      let payLoad: any = {
        dataSourceId: searchConditions.dataSourceId,
        indexName: searchConditions.indexName,
        filterConditions: searchConditions.filterConditions,
        queryCondition: searchConditions.queryCondition,
        searchTimeType: normalizedSearchTimeType,
      }

      if (normalizedSearchTimeType === 'SEARCH_TIME_TYPE_RELATIVE') {
        if (typeof searchConditions.minutesPast !== 'undefined') {
          payLoad.minutesPast = searchConditions.minutesPast
        }
      } else {
        if (typeof searchConditions.startTimestamp !== 'undefined') {
          payLoad.startTimestamp = searchConditions.startTimestamp
        }
        if (typeof searchConditions.endTimestamp !== 'undefined') {
          payLoad.endTimestamp = searchConditions.endTimestamp
        }
      }
      payLoad = {
        ...payLoad,
        page: searchConditions.page,
        pageSize: searchConditions.pageSize,
        sortOrder: searchConditions.sortOrder === 'asc' ? 'SORT_ORDER_ASC' : 'SORT_ORDER_DESC',
      }
      getList(payLoad)
    }

    // 计算属性
    const selectedFields = computed(() =>
      availableFields.value.filter((field) => field.selected).map((field) => field.name),
    )
    // Status counts based on example data. In real use, compute from response.
    const statusChecked = ref<StatusKey[]>(['Error', 'Warn', 'Info', 'Fatal', 'Debug'])

    // 初始化levels
    searchConditions.levels = statusChecked.value.map((key) => key.toUpperCase())

    // 将StatusKey转换为后端需要的格式（如'Error' -> 'ERROR'）
    const statusKeyToLevel = (key: StatusKey): string => {
      return key.toUpperCase()
    }

    // 处理状态改变，调用executeSearch
    const handleStatusChange = async (newStatuses: StatusKey[]) => {
      // 更新状态选中值
      statusChecked.value = newStatuses

      // 转换为后端需要的levels格式
      searchConditions.levels = newStatuses.map(statusKeyToLevel)

      // 如果已选择数据源和索引，则调用查询
      if (searchConditions.dataSourceId && searchConditions.indexName) {
        await executeSearch({})
      }
    }
    const statusCounts = computed<Record<StatusKey, number>>(() => {
      // 假计数：可根据 logDocuments 实际字段统计，比如 level 或 status
      const counts: Record<StatusKey, number> = { Error: 0, Warn: 0, Info: 0, Fatal: 0, Debug: 0 }
      logChartDatas.value.forEach((d) => {
        const level = (d as any).level as string | undefined
        if (!level) return

        // 处理后端返回的全大写格式，如 ERROR, WARN, INFO
        const normalizedLevel = level.toUpperCase()
        let key: StatusKey

        if (normalizedLevel === 'ERROR') key = 'Error'
        else if (normalizedLevel === 'WARN') key = 'Warn'
        else if (normalizedLevel === 'INFO') key = 'Info'
        else if (normalizedLevel === 'FATAL') key = 'Fatal'
        else if (normalizedLevel === 'DEBUG') key = 'Debug'
        else {
          // 如果不是标准格式，尝试首字母大写
          key = (level[0].toUpperCase() + level.slice(1).toLowerCase()) as StatusKey
        }

        if (counts[key] !== undefined) counts[key] = counts[key] + +d.count
      })
      console.log(counts)
      return counts
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
    const executeSearch = async (queryData: any) => {
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

      // 添加levels参数（如果有选中的状态，且不是全选5个状态）
      if (
        searchConditions.levels &&
        searchConditions.levels.length > 0 &&
        searchConditions.levels.length < 5
      ) {
        params.levels = searchConditions.levels
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
      await getList(params)

      // 查询后更新searchKey
      searchKey.value = searchConditions.queryCondition
        ? searchConditions.queryCondition.split(' ')[0] || ''
        : ''
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
        total.value = res.data.total
        getAvailableFields(logList)
      } finally {
        loading.value = false
        fieldsLoading.value = false
      }
    }
    // 从第一个日志条目的logJson动态解析字段
    const getAvailableFields = (logList) => {
      if (logList && logList.length > 0) {
        const firstLog = logList[0]
        if (firstLog && firstLog.logJson) {
          const parsedFields = parseFieldsFromLogJson(firstLog.logJson)
          availableFields.value = parsedFields.filter((field) => !field.name.includes('_source.'))
        }
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
          let logData: Record<string, any> = {}

          // 1️⃣ 兼容：如果存在 logJson 且是字符串，则尝试解析
          if (item.logJson && typeof item.logJson === 'string') {
            logData = JSON.parse(item.logJson)
          }
          // 2️⃣ 否则，认为 item 已经是解析后的对象
          else if (typeof item === 'object' && item !== null) {
            logData = { ...item }
          }

          // 3️⃣ 创建新对象，包含 timestamp 和解析结果
          const result: Record<string, any> = {
            timestamp: item.timestamp,
            ...logData,
          }

          // 4️⃣ 如果存在 _source 字段，将其拍平到第一层级
          if (logData._source && typeof logData._source === 'object') {
            Object.entries(logData._source).forEach(([key, value]) => {
              result[key] = value
            })
            delete result._source
          }

          return result
        } catch (error) {
          console.error('解析 JSON 失败:', error)
          // 返回原始数据并标记解析错误
          return {
            timestamp: item.timestamp,
            logJson: item.logJson ?? item,
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
        if (res.data.list.length && !searchConditions.dataSourceId) {
          searchConditions.dataSourceId = res.data.list[0].id
          getIndexListData(res.data.list[0].id)
        }
      } finally {
        dataSourceLoading.value = false
      }
    }
    // 获取索引列表数据
    const getIndexListData = async (value?: string) => {
      if (!value && !searchConditions.dataSourceId) {
        ElMessage.warning('请先选择数据源')
        return
      }
      try {
        indexListLoading.value = true
        const res = await getIndexList({ dataSourceId: value || searchConditions.dataSourceId })
        indexList.value = res.data.list
        searchConditions.indexId = null
        searchConditions.indexName = ''
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

    // 启动SSE日志流
    const startLogStream = () => {
      if (!searchConditions.indexId) {
        ElMessage.warning('请先选择索引')
        return
      }

      // 如果已有连接，先关闭
      if (logStream.value) {
        stopLogStream()
      }

      try {
        logStream.value = createLogStream(searchConditions.indexId)
        isStreaming.value = true
        // 监听消息
        logStream.value.onmessage = (event) => {
          try {
            const newLogData = JSON.parse(event.data).list
            if (Array.isArray(newLogData)) {
              // 将新日志数据添加到现有列表中
              const transformedLogs = transformLogData(newLogData)
              if (logDocuments.value.length <= 0) {
                getAvailableFields(newLogData)
              }
              logDocuments.value = [...transformedLogs, ...logDocuments.value]

              // 更新图表数据
              const newChartData = transformedLogs.map((log) => ({
                time: log.timestamp,
                level: (log as any).level || 'INFO',
                count: '1',
              }))
              logChartDatas.value = [...logChartDatas.value, ...newChartData]
            }
          } catch (error) {
            console.error('解析SSE日志数据失败:', error)
          }
        }

        // 监听错误
        logStream.value.onerror = (error) => {
          console.error('SSE连接错误:', error)
          ElMessage.error('日志流连接失败')
          stopLogStream()
        }

        // 监听连接关闭
        logStream.value.onopen = () => {
          console.log('SSE日志流连接已建立')
        }
      } catch (error) {
        console.error('创建SSE连接失败:', error)
        ElMessage.error('启动日志流失败')
        isStreaming.value = false
      }
    }

    // 停止SSE日志流
    const stopLogStream = () => {
      if (logStream.value) {
        logStream.value.close()
        logStream.value = null
      }
      isStreaming.value = false
      console.log('SSE日志流连接已关闭')
    }

    // 切换日志流状态
    const toggleLogStream = async () => {
      if (isStreaming.value) {
        // 关闭流，然后执行一次正常查询
        stopLogStream()
        searchConditions.searchTimeType = 1
        await executeSearch({})
      } else {
        // 开启前先执行一次正常查询（若未选索引则内部会提示并中断）
        if (!searchConditions.indexId) {
          ElMessage.warning('请选择索引')
          return
        }
        // 只清空 queryCondition、filterConditions、levels 三个字段
        searchConditions.queryCondition = ''
        searchConditions.filterConditions = []
        // 重置 levels 为全选状态（默认值）
        statusChecked.value = ['Error', 'Warn', 'Info', 'Fatal', 'Debug']
        searchConditions.levels = statusChecked.value.map((key) => key.toUpperCase())

        // 清除搜索关键字
        searchKey.value = ''

        searchConditions.searchTimeType = 2
        await executeSearch({})
        startLogStream()
      }
    }
    const handleChangeIndex = (val: string) => {
      const it = indexList.value.find((x) => x.indexName === val)
      searchConditions.indexId = it?.indexId || val || ''
      searchConditions.indexName = it?.indexName || val || ''
      const params = {
        dataSourceId: searchConditions.dataSourceId,
        indexName: val,
      }
      getIndexLogListData(params)
    }
    const getIndexLogListData = async (params) => {
      try {
        loading.value = true
        fieldsLoading.value = true
        const res = await getIndexLogList(params)
        const logList = res.data.list as LogDocument[]
        logDocuments.value = transformLogData(logList)
        total.value = res.data.total
        getAvailableFields(logList)
        // 清空查询与时间范围但保留索引选择
        searchConditions.queryCondition = ''
        searchConditions.filterConditions = []
        if (logList.length > 0) {
          const startTime = new Date(logList[logList.length - 1].timestamp).getTime() - 1000
          const endTime = new Date(logList[0].timestamp).getTime()
          params.startTimestamp = startTime
          params.endTimestamp = endTime
          params.searchTimeType = 1
          params.minutesPast = undefined
          params.sortOrder = 'desc'
          getChartData(params)
          searchConditions.startTimestamp = startTime
          searchConditions.endTimestamp = endTime
          isHasIndexList.value = false
        } else {
          logChartDatas.value = []
          searchConditions.startTimestamp = null
          searchConditions.endTimestamp = null
          isHasIndexList.value = true
        }
        searchConditions.searchTimeType = 1
        searchConditions.minutesPast = undefined
        searchConditions.sortOrder = 'desc'
      } finally {
        loading.value = false
        fieldsLoading.value = false
      }
    }
    onMounted(() => {
      getDataSourceListData()
    })

    onUnmounted(() => {
      // 组件卸载时清理SSE连接
      stopLogStream()
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
            <ElButton size='small' onClick={handleNew} disabled={!hasPermission(['log:get'])}>
              新建
            </ElButton>
            <ElButton
              size='small'
              type='primary'
              onClick={handleSave}
              disabled={!hasPermission(['log:get'])}
            >
              保存
            </ElButton>
            <ElButton size='small' onClick={handleOpen} disabled={!hasPermission(['log:get'])}>
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
                  clearable
                  filterable
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
                  onChange={handleChangeIndex}
                  clearable
                  filterable
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
              isStreaming={isStreaming.value}
              onUpdate:modelValue={(v: StatusKey[]) => {
                statusChecked.value = v
              }}
              onChange={handleStatusChange}
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
              startTimestamp={searchConditions.startTimestamp}
              endTimestamp={searchConditions.endTimestamp}
              searchTimeType={searchConditions.searchTimeType}
              minutesPast={searchConditions.minutesPast}
              filterConditions={searchConditions.filterConditions}
              isStreaming={isStreaming.value}
              isTimePaused={searchConditions.searchTimeType === 2}
              onUpdate:searchQuery={(value) => {
                searchConditions.queryCondition = value
              }}
              onSearch={executeSearch}
              onAddFilter={handleAddFilter}
              onRemoveFilter={(index: number) => {
                searchConditions.filterConditions.splice(index, 1)
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
              onUpdate:isTimePaused={(paused: boolean) => {
                searchConditions.searchTimeType = paused ? 2 : 1
              }}
              onToggleLogStream={toggleLogStream}
            />
            {/* 动态柱状图 */}
            <div v-loading={chartLoading.value}>
              <LogChart
                logChartData={logChartDatas.value}
                selectedStatuses={statusChecked.value}
                isHasIndexList={isHasIndexList.value}
              />
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
                  total={total.value}
                  searchKey={searchKey.value}
                  isStreaming={isStreaming.value}
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
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            v-loading={openViewListLoading.value}
          >
            {filteredViews.value.map((v) => (
              <div class={styles.viewItem}>
                <div
                  style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                  onClick={() => openView(v)}
                >
                  <ElIcon style={{ marginRight: '6px' }}>
                    <Search />
                  </ElIcon>
                  <span style={{ flex: 1 }}>{v.searchName}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <ElButton size='small' circle onClick={() => handleEditView(v)}>
                    <ElIcon>
                      <Edit />
                    </ElIcon>
                  </ElButton>
                  <ElButton size='small' circle type='danger' onClick={() => handleDeleteView(v)}>
                    <ElIcon>
                      <Delete />
                    </ElIcon>
                  </ElButton>
                </div>
              </div>
            ))}
          </div>
        </ElDrawer>
        {/* 编辑视图名 */}
        <ElDialog
          modelValue={editDialogVisible.value}
          title='编辑视图名称'
          width='420px'
          onUpdate:modelValue={(v: boolean) => (editDialogVisible.value = v)}
          v-slots={{
            footer: () => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <ElButton onClick={() => (editDialogVisible.value = false)}>取消</ElButton>
                <ElButton
                  type='primary'
                  loading={editLoading.value}
                  onClick={confirmEditView}
                  disabled={!editViewName.value.trim()}
                >
                  确认
                </ElButton>
              </div>
            ),
          }}
        >
          <ElInput placeholder='请输入新的名称' v-model={editViewName.value} />
        </ElDialog>

        {/* 删除确认 */}
        <ElDialog
          modelValue={deleteDialogVisible.value}
          title='删除确认'
          width='420px'
          onUpdate:modelValue={(v: boolean) => (deleteDialogVisible.value = v)}
          v-slots={{
            footer: () => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <ElButton onClick={() => (deleteDialogVisible.value = false)}>取消</ElButton>
                <ElButton type='danger' loading={deleteLoading.value} onClick={confirmDeleteView}>
                  删除
                </ElButton>
              </div>
            ),
          }}
        >
          确认要删除该视图吗？删除后不可恢复。
        </ElDialog>
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
