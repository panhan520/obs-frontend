/** 地区 */
export enum Zone {
  '全部' = '',
  '东北' = '东北',
  '华北' = '华北',
  '华中' = '华中',
  '华南' = '华南',
  '西北' = '西北',
  '西南' = '西南',
}

/** 地区 */
export const zoneOptions = [
  { label: '全部', value: Zone['全部'] },
  { label: '东北', value: Zone['东北'] },
  { label: '华北', value: Zone['华北'] },
  { label: '华中', value: Zone['华中'] },
  { label: '华南', value: Zone['华南'] },
  { label: '西北', value: Zone['西北'] },
  { label: '西南', value: Zone['西南'] },
]

// 运营商
export enum Isp {
  '全部' = '',
  '移动' = '移动',
  '联通' = '联通',
  '电信' = '电信',
  '港澳' = '港澳',
  '台湾' = '台湾',
}

// 运营商
export const ispOptions = [
  { label: '全部', value: Isp['全部'] },
  { label: '移动', value: Isp['移动'] },
  { label: '联通', value: Isp['联通'] },
  { label: '电信', value: Isp['电信'] },
  { label: '港澳', value: Isp['港澳'] },
  { label: '台湾', value: Isp['台湾'] },
]
