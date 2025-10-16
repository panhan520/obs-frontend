import type { Column } from 'element-plus'

const fields: Column[] = [
  {
    prop: 'createdAt',
    label: '时间',
    width: 130,
  },
  {
    prop: 'status',
    label: '状态',
    width: 130,
  },
  {
    prop: 'expiryDate',
    label: '过期时间',
    minWidth: 130,
  } as any,
]

export default fields
