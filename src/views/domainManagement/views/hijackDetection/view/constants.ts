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
