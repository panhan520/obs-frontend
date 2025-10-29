export interface LogField {
  name: string
  type: string
  selected: boolean
  isSystemField?: boolean // 是否为系统字段，系统字段不可手动删除
}

export interface LogDocument {
  timestamp: string
  logJson: string
  _id?: string
  _index?: string
  _score?: number
  _type?: string
  '@timestamp'?: string
  agent_hostname?: string
  event?: string
  fcservice?: string
  fcsource?: string
  [key: string]: any
}
export interface logChartData {
  time: string
  level: string
  count: string
}

export interface FilterCondition {
  field: string
  operator: string
  value: string
  isValid?: boolean // 是否为有效的过滤条件
}

// 检索日志柱状图查询参数
export interface FilterCondition {
  field: string
  operator: string
  value: string
}
export interface LogHistogramParams {
  dataSourceId?: number
  indexName?: string
  searchTimeType?: string
  startTimestamp?: number
  endTimestamp?: number
  minutesPast?: number
  queryCondition?: string
  filterConditions?: FilterCondition[]
}

// 检索日志柱状图响应
export interface LogHistogramResponse {
  data: {
    summary: []
    histogram: []
  }
}

// 分页检索列表查询参数
export interface LogListParams {
  dataSourceId?: number
  indexName: string
  searchTimeType: string
  startTimestamp?: string
  endTimestamp?: string
  minutesPast?: number
  queryCondition?: string
  filterConditions?: []
  page?: number
  pageSize?: number
  sortOrder?: string
}

// 分页检索列表响应
export interface LogListResponse {
  data: {
    total: number
    list: []
  }
}
// 保存的视图项
export interface SavedView {
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

// 检索日志视图查询参数
export interface QueryCondsResponse {
  views: SavedView[]
}
// 保存检索条件查询参数
export interface SaveCondsResponse {
  details: []
}
// 索引列表查询参数
export interface IndexListParams {
  dataSourceId: number
}
// 索引列表响应
export interface IndexListResponse {
  data: {
    total?: number
    list?: []
  }
}
