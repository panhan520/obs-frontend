import getReqByProxyModule from '@/config/request'
import { PROXY } from '@/config/constants'
import { useUserStore } from '@/store/modules/useAuthStore'
import { EventSourcePolyfill } from 'event-source-polyfill'
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
  return request.post('/log/save-query', params)
}

// 编辑检索条件（只能编辑名称）
export const editQueryConds = (params: {
  id: number
  searchName: string
}): Promise<SaveCondsResponse> => {
  return request.post('/log/edit-query', params)
}

// 删除检索条件
export const deleteQueryConds = (id: number) => {
  return request.delete(`/log/delete-query/${id}`)
}

// 查询索引列表
export const getIndexList = (params: IndexListParams): Promise<IndexListResponse> => {
  return request.post('/index/list', params)
}

// 创建SSE日志流连接
export const createLogStream = (indexId: string): EventSource => {
  const baseURL = import.meta.env.VITE_APP_BASE_API_LOG || ''
  const url = `${baseURL}/stream?indexId=${indexId}`
  const userStore = useUserStore()
  const token: string = userStore.userInfo?.token // TODO: error
  return new EventSourcePolyfill(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true, // 如果需要携带 cookie
  })
}

// 选择索引后初始检索列表
export const getIndexLogList = (params: LogListParams): Promise<LogListResponse> => {
  return request.post('/log/init-list', params)
}
