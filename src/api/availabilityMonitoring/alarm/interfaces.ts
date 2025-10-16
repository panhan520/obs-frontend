/** 列 */
export interface IListItem {
  /** 告警时间 */
  alarmTime: string
  /** 域名/地址 */
  domainOrAddress: string
  /** 任务名称 */
  taskName: string
  /** 请求类型 */
  requestType: string
  /** 监测节点 */
  monitorNode: string
  /** 告警原因 */
  alarmReason: string
  /** 告警优先级 */
  alarmPriority: string
  /** 通知人 */
  notifier: string
  /** 通知结果 */
  notifyResult: string
  /** 通知时间 */
  notifyTime: string
  /** 通知方式 */
  notifyMethod: string
}
