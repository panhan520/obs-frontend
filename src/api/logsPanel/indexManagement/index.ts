import getReqByProxyModule from '~/config/request'
import type { ICommonGetListRes, ICommonObj } from '~/interfaces/common'
import { PROXY } from '~/config/constants'
const request = getReqByProxyModule({ proxyModule: PROXY.INDEXMANAGEMENT })
console.log(PROXY.INDEXMANAGEMENT, 888777);
console.log('当前 request baseURL:', request.defaults.baseURL)


// 创建
export const createIndexApi = <T = any>(data: any): Promise<T> => {
  return request.post('/api/v1/logging/index/create', data)
}
// 编辑
export const editIndexApi = <T = any>(params?: any): Promise<T> => {
  return request.get('/api/v1/logging/index/create', { params })
}
// 删除
export const deleteIndexApi = <T = any>(data: any): Promise<T> => {
  return request.post('/api/v1/logging/index/delete', data)
}
// 获取数据源
export const getDatasourceApi = (): Promise<any> => {
  return request.get('/config/v1/datasource/list')
}
export const getIndexApi = async (data: ICommonObj): Promise<any> => {
  try {
    const sendData = {
      ...data,
      page: data.pagination?.page,
      pageSize: data.pagination?.pageSize,
    }
    delete sendData.pagination // TODO
    if (data.dataSourceId) {
      const res = await request.post('/api/v1/logging/index/list', sendData)
      return Promise.resolve({
        list: res.data.list,
        pagination: Object.keys(res.data.pagination).reduce((acc, key) => {
          acc[key] = Number(res.data.pagination[key]);
          return acc;
        }, {}),
      })
    }
  } catch (error: any) {
    console.error(`获取列表失败，失败原因：${error}`)
  }
  return {
    list: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
    },
  }
}
// 校验索引名的唯一性
export const existIndexApi = <T = any>(params: any): Promise<T> => {
  return request.get('/api/v1/logging/index/exist', { params })
}
