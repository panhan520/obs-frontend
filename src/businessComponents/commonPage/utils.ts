import type { Ref } from 'vue'
import type { ISchema } from '@formily/vue'
import type { IField } from '~/interfaces/commonPage'
import type { ICommonFilterExpose } from '../commonFilter'

/** 将table的field转为formily的jsonSchema */
export const formatTableToFormily = (field: IField, key: 'filterConfig' | 'editConfig'): ISchema => {
  return {
    [field.prop]: {
      ...field[key],
      title: field.label,
    },
  }
}

/** 获取表格高度 */
export const getTableHeight = (commonFilterRef: Ref<ICommonFilterExpose>) => {
  return `calc(100vh - 40px - 16px - ${commonFilterRef.value?.getCommonFilterHeight()}px - 8px - 32px - 8px - 8px - 32px - 16px - 41px - 98px)` // TODO: 98px要去掉，太定制化。
}
