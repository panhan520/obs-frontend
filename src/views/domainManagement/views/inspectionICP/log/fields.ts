import type { Column } from 'element-plus'

const fields: Column[] = [
  {
    prop: 'createdAt',
    label: '时间',
  },
  {
    prop: 'status',
    label: '状态',
  },
  {
    prop: 'result',
    label: '运行结果',
  } as any,
]

export default fields
