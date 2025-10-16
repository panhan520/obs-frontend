import getReqByProxyModule from '~/config/request'
import { PROXY } from '~/config/constants'

import type { ICommonGetListRes, ICommonObj } from '~/interfaces/common'
import type { IListItem } from './interfaces'

const request = getReqByProxyModule({ proxyModule: PROXY.DOMAIN })

/** 列表 */
export const getListApi = async (params: ICommonObj): Promise<ICommonGetListRes<IListItem[]>> => {
  try {
    params = {
      ...params,
      ...params.pagination,
    }
    delete params.total
    delete params.pagination
    const res: ICommonObj = await request.get('/inspect/icp/', { params })
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
  params = {
    ...params,
    domain: [params.domain],
    noticeMode: [params.noticeMode],
  }
  return request.post('/inspect/icp/', params)
}

/** 编辑 */
export const editApi = (params: ICommonObj) => {
  return request.put(`/inspect/icp/${params.id}/`, params)
}

/** 获取所属项目下拉选 */
export const getUsersProjectApi = (params: ICommonObj) => {
  params = {
    page: 1,
    pageSize: 1000,
  }
  return request.get('/users/project/', { params })
}

/** 删除 */
export const deleteApi = (params: ICommonObj) => {
  return request.delete(`/inspect/icp/${params.id}/`)
}

/** 获取详情 */
export const getDetailApi = async (params: ICommonObj) => {
  const res = await request.get(`/inspect/icp/${params.id}/`)
  return res.data
}

/** 获取历史快照列表 */
export const getRecordApi = async (params: ICommonObj) => {
  try {
    params = {
      ...params,
      ...params.pagination,
    }
    delete params.total
    delete params.pagination
    const res = await request.get('/inspect/icp-record/', { params })
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
