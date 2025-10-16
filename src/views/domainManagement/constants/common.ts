/** 监控状态 */
export enum InspectStatus {
  /** 异常 */
  ABNORMAL = 'abnormal',
  /** 正常 */
  NORMAL = 'normal',
}

/** 监控状态 */
export const inspectStatusMap = {
  /** 异常 */
  [InspectStatus.ABNORMAL]: {
    text: '异常',
    type: 'warning',
  },
  /** 正常 */
  [InspectStatus.NORMAL]: {
    text: '正常',
    type: 'primary',
  },
}

// 固定频率
export enum Frequency {
  '1m' = '1m',
  '1h' = '1h',
  '1d' = '1d',
  '1w' = '1w',
}

// 固定频率options
export const frequencyOptions = [
  { label: '每分钟', value: '1m' },
  { label: '每小时', value: '1h' },
  { label: '每天', value: '1d' },
  { label: '每周', value: '1w' }
]

// 固定频率Map
export const frequencyMap = {
  [Frequency['1m']]: '每分钟',
  [Frequency['1h']]: '每小时',
  [Frequency['1d']]: '每天',
  [Frequency['1w']]: '每周',
}

/** 通知渠道 */
export enum NoticeChannel {
  /** TELEGRAM */
  TELEGRAM = 'telegram'
}

/** 通知渠道 */
export const noticeChannelOptions = [
  { label: 'telegram', value: NoticeChannel.TELEGRAM }
]
