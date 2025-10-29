
import type { IField } from '~/interfaces/commonPage'
import Space from '~/basicComponents/space'

const commonAttrs = {
  link: true,
}
export const getFields = ({ router, commonTableRef }): IField[] => [{
  prop: 'indexName',
  label: '索引名称',
} as any,
]
