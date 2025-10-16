/** 请求类型 */
export enum SubTypeEnum {
  ALL = 'ALL',
  HTTP = 'HTTP',
  TCP = 'TCP',
  UDP = 'UDP',
}

/** 请求类型 */
export const subTypeOptions = [
  { label: '全部', value: SubTypeEnum.ALL },
  { label: 'HTTP', value: SubTypeEnum.HTTP },
  { label: 'TCP', value: SubTypeEnum.TCP },
  { label: 'UDP', value: SubTypeEnum.UDP },
]
