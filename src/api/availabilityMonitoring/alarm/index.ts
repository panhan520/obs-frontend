import getReqByProxyModule from '~/config/request'
import { PROXY } from '~/config/constants'

import type { ICommonGetListRes, ICommonObj } from '~/interfaces/common'
import type { IListItem } from './interfaces'

const request = getReqByProxyModule({ proxyModule: PROXY.AVAILABILITY })

/** 获取列表 */
export const getListApi = (params: ICommonObj): Promise<ICommonGetListRes<IListItem[]>> => {
  return request.get(`/line/api_test/v1/alerts`, { params })
}

/** 获取GrafanaUrl */
export const getGrafanaUrlApi = (params: ICommonObj): Promise<Record<'grafanaUrl', string>> => {
  return request.get(`/line/api_test/v1/chart/alerts`, { params })
}
