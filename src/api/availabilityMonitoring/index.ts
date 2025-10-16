import getReqByProxyModule from '~/config/request'
import { PROXY } from '~/config/constants'

import type { ICommonGetListRes, ICommonObj } from '~/interfaces/common'
import type {
  IListItem,
  ICreateParams,
  IDetailRes,
  ILocationsRes,
  IExtra,
  IHistoryTaskItem,
  IHistoryTaskResult,
  IMonitoringNodeList,
  IBasicTaskData,
} from './interfaces'

const request = getReqByProxyModule({ proxyModule: PROXY.AVAILABILITY })
// const request = getReqByProxyModule({ proxyModule: '' as any }) // TODO: 本地mock数据，上线前注释

/** 顶部卡片 + 左侧快速筛选 */
export const getListExtraApi = (): Promise<IExtra> => {
  return request.get('/line/api_test/v1/tests/combined_stats')
}

/** 获取告警配置：通知人/变量 */
export const getNotifierAndVarApi = (): Promise<Record<string, any>> => {
  return request.get(`/line/api_test/v1/tests/monitors`)
}

/** 获取位置列表 */
export const getLocationsApi = (): Promise<ILocationsRes> => {
  return request.get('/line/probe_executor/v1/locations')
}

/** 获取历史任务二级联动位置数据 */
export const getMonitoringNodesApi = (): Promise<Record<'locations' | 'isp', IMonitoringNodeList[]>> => {
  return request.get(`line/probe_executor/v1/structured_locations`)
}

/** 删除测试数据 */
export const removeTestApi = (params: Record<'testIds', string[]>) => {
  return request.post('/line/api_test/v1/tests/delete', params)
}

/** 启用测试数据 */
export const enableTestApi = (params: Record<'testIds', string[]>) => {
  return request.post('/line/api_test/v1/tests/status', { testIds: params.testIds, newStatus: 'LIVE' })
}

/** 暂停测试数据 */
export const pauseTestApi = (params: Record<'testIds', string[]>) => {
  return request.post('/line/api_test/v1/tests/status', { testIds: params.testIds, newStatus: 'PAUSED' })
}

/** 可用性测试列表 */
export const getListApi = (params: ICommonObj): Promise<ICommonGetListRes<IListItem[]>> => {
  return request.get('/line/api_test/v1/tests', { params })
  // return request.get('/line/api_test/v1/tests')
}

/** 获取任务基础信息 */
export const getTaskBasicDataApi = (params: Record<string, string>): Promise<IBasicTaskData> => {
  return request.get(`/line/api_test/v1/tests/${params.testId}/basic_info`)
}

/** 创建测试详情 */
export const createApi = (params: ICreateParams): Promise<IDetailRes> => {
  return request.post('/line/api_test/v1/tests', params)
}

/** 编辑测试详情 */
export const editApi = (params: IDetailRes): Promise<IDetailRes> => {
  return request.put(`line/api_test/v1/tests/${params.test.testId}`, params)
}

/** 获取测试详情 */
export const getDetailApi = (testId: string): Promise<IDetailRes> => {
  return request.get(`/line/api_test/v1/tests/${testId}`)
}

/** 测试预览 */
export const preTestApi = (params: ICommonObj): Promise<ICommonObj> => {
  return request.post('/line/api_test/v1/tests/pre_run', params, { timeout: 10000 })
}

/** 上传文件 */
export const uploadApi = async (params: Record<'file', File>): Promise<Record<'url', string>> => {
  try {
    const formData = new FormData()
    formData.append('file', params.file)
    return request.post(`/line/utils/v1/file`, formData)
  } catch (error: any) {
    console.error(error)
  }
}

/** 获取调用方法 */
export const getMethodListApi = (params: ICommonObj) => {
  return request.post('/line/utils/v1/grpc_methods', params)
}

/** 获取历史任务列表 */
export const getTaskHistory = (params: Record<string, string>): Promise<ICommonGetListRes<IHistoryTaskItem[]>> => {
  return request.get(`/line/api_test/v1/tests/${params.testId}/results`, { params })
  // return request.get(`/line/api_test/v1/tests/${params.testId}/results`)
}

/** 获取历史任务详情 */
export const getHistoryTaskDetail = (params: Record<string, string>): Promise<IHistoryTaskResult> => {
  return request.get(`/line/api_test/v1/tests/${params.testId}/results/${params.resultId}`)
  // return request.get(`/line/api_test/v1/tests/testId/results/resultId`)
}
