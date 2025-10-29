import getReqByProxyModule from '@/config/request'
import { PROXY } from '@/config/constants'
import type {
  DataSourceListParams,
  DataSourceListResponse,
  DataSourceDetail,
  CreateDataSourceParams,
  UpdateDataSourceParams,
} from './interfaces'

// 创建请求实例
const request = getReqByProxyModule({ proxyModule: PROXY.DATASOURCE })

// 获取数据源列表
export const getDataSourceList = (
  params: DataSourceListParams,
): Promise<DataSourceListResponse> => {
  return request.get('/datasourceManagement/list', { params })
}

// 创建数据源
export const createDataSource = (data: CreateDataSourceParams): Promise<DataSourceDetail> => {
  return request.post('/datasourceManagement', { datasource: data })
}

// 获取数据源详情
export const getDataSourceDetail = (id: string): Promise<DataSourceDetail> => {
  return request.get(`/datasourceManagement/${id}`)
}

// 更新数据源
export const updateDataSource = (
  id: string,
  data: UpdateDataSourceParams,
): Promise<DataSourceDetail> => {
  return request.put(`/datasourceManagement/${id}`, data)
}

// 删除数据源
export const deleteDataSource = (id: string): Promise<void> => {
  return request.delete(`/datasourceManagement/${id}`)
}

// 测试数据源连接
export const testDataSourceConnection = (
  data: CreateDataSourceParams,
): Promise<{ success: boolean; message: string }> => {
  return request.post('/datasourceManagement/connect', data)
}

// 可用数据源列表
export const getDatasourceUseList = (): Promise<DataSourceListResponse> => {
  return request.get('/datasource/list')
}
