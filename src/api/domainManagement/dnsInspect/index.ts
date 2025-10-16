import getReqByProxyModule from '~/config/request'
import { PROXY } from '~/config/constants'

import type { ICommonGetListRes, ICommonObj } from '~/interfaces/common'
import type { IListItem } from './interfaces'

const request = getReqByProxyModule({ proxyModule: PROXY.DOMAIN })

/** 检测结果列表 */
export const getListApi = async (params: ICommonObj): Promise<ICommonGetListRes<IListItem[]>> => {
  try {
    const sendData = {
      ...params,
      page: params.pagination?.page,
      pageSize: params.pagination?.pageSize,
    }
    delete sendData.pagination // TODO
    const res: ICommonObj = await request.get('/inspect/dns/', { params: sendData })
    // const res: ICommonObj = await request.get('/inspect/dns/')
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

/** 删除 */
export const deleteApi = ({ id }: Record<'id', string>): Promise<Record<'status', boolean>> => { // 与真实的返回体不同，因为真实的数据类型太lowb
  return request.delete(`/inspect/dns/${id}/`)
}

/** 启用 */
export const enableApi = ({ id }: Record<'id', string>) => {
  return request.put(`/inspect/dns/${id}/`, { taskStatus: true })
}

/** 禁用 */
export const disabledApi = ({ id }: Record<'id', string>) => {
  return request.put(`/inspect/dns/${id}/`, { taskStatus: false })
}

/** 获取节点 */
export const getNodesApi = async () => {
  try {
    const res = await request.get('/inspect/nodes/')
    return res?.data
  } catch (error: any) {
    console.error(`获取节点失败，失败原因：${error}`)
  }
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
    const res: ICommonObj = await request.get('/inspect/dns-record/', { params: sendData })
    return Promise.resolve({
      list: res.data.data,
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

/** 历史快照左侧节点列表 */
export const getHistoryNodeListApi = async (params: ICommonObj) => {
  try {
    const sendData = {
      ...params,
      page: params.pagination?.page,
      pageSize: params.pagination?.pageSize,
    }
    delete sendData.pagination // TODO
    const res = await request.get('/inspect/nodes/list-table/', { params: sendData })
    return Promise.resolve({
      list: res.data.map((v: ICommonObj, index: number) => ({ ...v, index: index })),
      pagination: res.data.pagination,
    })
  } catch (error: any) {
    console.error(`获取节点失败，失败原因：${error}`)
  }
}

/** 创建 */
export const createApi = async (params: ICommonObj) => {
  return request.post('/inspect/dns/', params)
}

/** 获取详情 */
export const getDetailApi = async (params: ICommonObj) => {
  try {
    const res = await request.get(`/inspect/dns/${params.id}/`)
    return res?.data
  } catch (error: any) {
    console.error(`获取节点失败，失败原因：${error}`)
  }
}

/** 编辑详情 */
export const editApi = async (params: ICommonObj) => {
  try {
    const res = await request.put(`/inspect/dns/${params.id}/`, params)
    return res?.data
  } catch (error: any) {
    console.error(`获取节点失败，失败原因：${error}`)
  }
}
