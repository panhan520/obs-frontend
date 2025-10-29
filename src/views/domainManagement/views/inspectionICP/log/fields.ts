import type { Column } from 'element-plus'
import { ElText } from 'element-plus'
import { h } from 'vue'

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
    render: ({ rowData }) => h(ElText, {}, JSON.stringify(rowData.result)),
  } as any,
]

export default fields
