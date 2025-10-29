import getReqByProxyModule from '~/config/request'
import { PROXY } from '~/config/constants'
const coreAxios = getReqByProxyModule({ proxyModule: PROXY.CORE })
const userAxios = getReqByProxyModule({ proxyModule: PROXY.USER })
// 创建api key
export const generateKeyApi = <T = any>(data: any): Promise<T> => {
  return userAxios.post('/v1/generate/key', data)
}
// 编辑api key
export const editKeyApi = <T = any>(params?: any): Promise<T> => {
  return userAxios.get(`/v1/key`, { params })
}
// 删除api key
export const deleteKeyApi = <T = any>(data: any): Promise<T> => {
  return userAxios.delete(`/v1/key/${data.keyId}/${data.id}`)
}
// 获取api key 列表
export const getKeyApi = <T = any>(data: any, params: any): Promise<T> => {
  return userAxios.get(`/v1/key/${data.type}/${data.id}`, { params })
}
// 获取agent列表
export const getAgentApi = <T = any>(data: any, params: any): Promise<T> => {
  return coreAxios.get(`/v1/agent/${data.tenantId}`, { params })
}
