import type { Ref } from 'vue'
import type { ILocationItem, IMonitoringNodeList } from '~/api/availabilityMonitoring/interfaces'
import type { IOptionItem } from '~/interfaces/common'

/** 可用性主数据 */
export interface IMasterData {
  /** 通知人列表 */
  monitors?: IOptionItem[]
  /** 变量列表 */
  variables?: IOptionItem[]
  /** 位置接口出参 */
  locations?: ILocationItem[]
  /** 监测节点列表 */
  monitoringNodes?: IMonitoringNodeList[]
  /** 监测节点运营商列表 */
  monitoringIsps?: IMonitoringNodeList[]
}

/** 可用性主数据Store出参 */
export interface IRes {
  /** 可用性主数据 */
  masterData: Ref<IMasterData>
  /** 获取可用性主数据 */
  getMasterData: () => Promise<void>
  /** 获取历史任务之二级联动地址主数据 */
  getMonitoringNodes: () => Promise<void>
}