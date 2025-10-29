import getReqByProxyModule from '@/config/request'
import { PROXY } from '@/config/constants'
import type {
  LogHistogramParams,
  LogHistogramResponse,
  LogListParams,
  LogListResponse,
  QueryCondsResponse,
  SaveCondsResponse,
  IndexListParams,
  IndexListResponse,
} from './interfaces'

// 创建请求实例
const request = getReqByProxyModule({ proxyModule: PROXY.LOG })

// 检索日志柱状图
export const getLogHistogram = (params: LogHistogramParams): Promise<LogHistogramResponse> => {
  return request.post('/log/histogram', params)
}

// 分页检索列表
export const getLogList = (params: LogListParams): Promise<LogListResponse> => {
  return request.post('/log/list', params)
}

// 查询保存的检索条件列表
export const getQueryConds = (): Promise<QueryCondsResponse> => {
  return request.get('/log/query-conds')
}

// 保存检索条件
export const setQueryConds = (params: LogHistogramParams): Promise<SaveCondsResponse> => {
  return request.post('/save-query', params)
}

// 查询索引列表
export const getIndexList = (params: IndexListParams): Promise<IndexListResponse> => {
  return request.post('/index/list', params)
}
