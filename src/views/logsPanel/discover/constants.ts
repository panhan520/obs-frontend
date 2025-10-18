// 相对时间选项常量
export const RELATIVE_TIME_OPTIONS = [
  // 过去时间选项
  { label: 'Seconds ago', value: 'seconds' },
  { label: 'Minutes ago', value: 'minutes' },
  { label: 'Hours ago', value: 'hours' },
  { label: 'Days ago', value: 'days' },
  { label: 'Weeks ago', value: 'weeks' },
  { label: 'Months ago', value: 'months' },
  { label: 'Years ago', value: 'years' },
  // 未来时间选项
  { label: 'Seconds from now', value: 'seconds_from_now' },
  { label: 'Minutes from now', value: 'minutes_from_now' },
  { label: 'Hours from now', value: 'hours_from_now' },
  { label: 'Days from now', value: 'days_from_now' },
  { label: 'Weeks from now', value: 'weeks_from_now' },
  { label: 'Months from now', value: 'months_from_now' },
  { label: 'Years from now', value: 'years_from_now' },
] as const

// 相对时间单位类型
export type RelativeTimeUnit = (typeof RELATIVE_TIME_OPTIONS)[number]['value']

// 默认相对时间设置
export const DEFAULT_RELATIVE_AMOUNT = 3
export const DEFAULT_RELATIVE_UNIT: RelativeTimeUnit = 'weeks'

// 时间格式化选项
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
}

// 弹框配置
export const POPOVER_CONFIG = {
  width: 520,
  placement: 'bottom-start' as const,
}

// 时间选择器标签页
export const TIME_TABS = [
  { label: 'Absolute', value: 'absolute' },
  { label: 'Relative', value: 'relative' },
  { label: 'Now', value: 'now' },
] as const

export type TimeTab = (typeof TIME_TABS)[number]['value']
