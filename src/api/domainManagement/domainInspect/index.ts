import getReqByProxyModule from '~/config/request'
import { PROXY } from '~/config/constants'

import type { ICommonGetListRes, ICommonObj } from '~/interfaces/common'
import type { IListItem } from './interfaces'

const request = getReqByProxyModule({ proxyModule: PROXY.DOMAIN })
// const request = getReqByProxyModule({ proxyModule: '' as any }) // TODO: 本地mock数据，上线前注释

/** 检测结果列表 */
export const getListApi = async (params: ICommonObj): Promise<ICommonGetListRes<IListItem[]>> => {
  try {
    const sendData = {
      ...params,
      page: params.pagination?.page,
      pageSize: params.pagination?.pageSize,
    }
    delete sendData.pagination // TODO
    const res: ICommonObj = await request.get('/inspect/domain-expiry/', { params: sendData })
    return Promise.resolve({
      list: res.data.list,
      pagination: res.data.pagination,
    })
  } catch (error: any) {
    console.error(`获取列表失败，失败原因：${error}`)
    return {
      list: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
    }
  }
}

/** 创建 */
export const createApi = (params: ICommonObj) => {
  return request.post('/inspect/domain-expiry/', params)
}

/** 编辑 */
export const editApi = (params: ICommonObj) => {
  return request.put(`/inspect/domain-expiry/${params.id}/`, params)
}

/** 获取详情 */
export const getDetailApi = async (params: ICommonObj) => {
  const res = await request.get(`/inspect/domain-expiry/${params.id}/`)
  return res.data
}

/** 删除 */
export const deleteApi = ({ id }: Record<'id', string>): Promise<Record<'status', boolean>> => { // 与真实的返回体不同，因为真实的数据类型太lowb
  return request.delete(`/inspect/domain-expiry/${id}/`)
}

/** 启用 */
export const enableApi = ({ id }: Record<'id', string>) => {
  return request.put(`/inspect/domain-expiry/${id}/`, { taskStatus: true })
}

/** 禁用 */
export const disabledApi = ({ id }: Record<'id', string>) => {
  return request.put(`/inspect/domain-expiry/${id}/`, { taskStatus: false })
}

/** 获取历史快照 */
export const getHistoryListApi = async (params: ICommonObj): Promise<ICommonGetListRes<IListItem[]>> => {
  try {
    const sendData = {
      ...params,
      page: params.pagination?.page,
      pageSize: params.pagination?.pageSize,
    }
    delete sendData.pagination // TODO
    const res: ICommonObj = await request.get('/inspect/domain-expiry-record/', { params: sendData })
    return Promise.resolve({
      list: res.data.list,
      pagination: res.data.pagination,
    })
  } catch (error: any) {
    console.error(`获取列表失败，失败原因：${error}`)
    return {
      list: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
    }
  }
}
