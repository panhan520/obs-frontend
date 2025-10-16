import type { Column } from 'element-plus'

const fields: Column[] = [
  {
    prop: 'createdAt',
    label: '时间',
  },
  {
    prop: 'isPollution',
    label: '是否被污染',
  } as any,
  {
    prop: 'status',
    label: '状态',
  },
]

export default fields
