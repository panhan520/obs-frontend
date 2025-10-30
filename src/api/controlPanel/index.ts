import getReqByProxyModule from '~/config/request'
import { PROXY } from '~/config/constants'
const coreAxios = getReqByProxyModule({ proxyModule: PROXY.CORE })
// 新增目录/修改目录
export const updateFolderApi = (data: any) => {
  return coreAxios.patch('/folders', data)
}
// 删除目录
export const deleteFolderApi = (data: any) => {
  return coreAxios.delete('/folders', { data: data })
}
// 目录列表
export const listFolderApi = (params: any) => {
  return coreAxios.get('/folders', { params })
}
// 仪表盘列表
export const listBoardsApi = (data: any) => {
  return coreAxios.post('/boards/list', data)
}
// 新增仪表盘
export const createBoardApi = (data: any) => {
  return coreAxios.post('/boards', data)
}
// 导入仪表盘
export const importBoardApi = (data: any) => {
  return coreAxios.post('/boards/import', data)
}
// 删除仪表盘
export const deleteBoardApi = (data: any) => {
  return coreAxios.delete('/boards/batch', { data: data })
}
// 取消收藏
export const unfavoriteApi = (data: any) => {
  return coreAxios.put('/boards/batch/unfavorite', data)
}
// 收藏仪表盘
export const favoriteApi = (data: any) => {
  return coreAxios.put('/boards/favorite', data)
}
// 创建人
export const getCreatorsApi = (params: any) => {
  return coreAxios.get('/boards/creators', { params })
}
// 搜索
export const searchApi = (data: any) => {
  return coreAxios.post('/boards/search', data)
}
// 仪表盘详情
export const detailBoardsApi = (data: any) => {
  return coreAxios.post('/boards/detail', data)
}
// 不知道干啥的
export const vistApi = (data: any) => {
  return coreAxios.post('/boards/visit', data)
}
