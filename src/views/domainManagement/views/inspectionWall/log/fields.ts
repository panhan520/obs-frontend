import type { Column } from 'element-plus'

const fields: Column[] = [
  {
    prop: 'createdAt',
    label: '时间',
  },
  {
    prop: 'isWall',
    label: '是否被墙',
  } as any,
  {
    prop: 'status',
    label: '状态',
  },
]

export default fields
