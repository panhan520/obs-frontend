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
const request = getReqByProxyModule({ proxyModule: PROXY.API })

// 获取数据源列表
export const getDataSourceList = (
  params: DataSourceListParams,
): Promise<DataSourceListResponse> => {
  return request.get('/config/v1/datasourceManagement/list', { params })
}

// 创建数据源
export const createDataSource = (data: CreateDataSourceParams): Promise<DataSourceDetail> => {
  return request.post('/config/v1/datasourceManagement', data)
}

// 获取数据源详情
export const getDataSourceDetail = (id: string): Promise<DataSourceDetail> => {
  return request.get(`/config/v1/datasourceManagement/${id}`)
}

// 更新数据源
export const updateDataSource = (
  id: string,
  data: UpdateDataSourceParams,
): Promise<DataSourceDetail> => {
  return request.put(`/config/v1/datasourceManagement/${id}`, data)
}

// 删除数据源
export const deleteDataSource = (id: string): Promise<void> => {
  return request.delete(`/config/v1/datasourceManagement/${id}`)
}

// 测试数据源连接
export const testDataSourceConnection = (
  data: CreateDataSourceParams,
): Promise<{ success: boolean; message: string }> => {
  return request.post('/config/v1/datasourceManagement/connect', data)
}
