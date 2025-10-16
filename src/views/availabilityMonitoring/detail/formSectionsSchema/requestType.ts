import { cloneDeep } from 'lodash'
import { getCollapseTitle } from './commonFields'
import { protocolOptions, Protocol, requestDefault } from '../constants'
import { BasicTabs } from './defineRequest/constants'

import type { Field as IField } from '@formily/core'
import type { ISchema } from '@formily/vue'
import type { IGetSchemaParams } from '../interfaces'

const getSchema = ({ isCreate }: IGetSchemaParams): ISchema => ({
  type: 'void',
  'x-component': 'FormCollapse.Item',
  'x-component-props': {
    title: getCollapseTitle({ index: 1, title: '请求类型' }),
  },
  properties: {
    /** 协议 */
    protocol: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      'x-component-props': {
        buttonStyle: 'solid',
        optionType: 'button',
        size: 'small',
        disabled: !isCreate,
      },
      enum: protocolOptions,
      default: Protocol.HTTP,
      'x-reactions': (field: IField) => {
        if (!field.modified) {
          return
        }
        const result = cloneDeep(requestDefault)
        const requestField = field.query('request')?.take() as IField
        requestField?.setValue(result[field.value])
      },
    },
    basicActiveKey: {
      type: 'string',
      default: BasicTabs.BEHAVIOR_CHECK,
      'x-display': 'hidden',
      'x-reactions': (field) => {
        field.value = field.value ? field.value : BasicTabs.BEHAVIOR_CHECK
      }
    },
  },
})

export default getSchema
