// types/log.ts
export interface LogField {
  name: string
  type: string
  selected: boolean
  isSystemField?: boolean // 是否为系统字段，系统字段不可手动删除
}

export interface LogDocument {
  _id: string
  _index: string
  _score: number
  _type: string
  '@timestamp': string
  agent_hostname: string
  event: string
  fcservice: string
  fcsource: string
  [key: string]: any
}

export interface FilterCondition {
  field: string
  operator: string
  value: string
}
