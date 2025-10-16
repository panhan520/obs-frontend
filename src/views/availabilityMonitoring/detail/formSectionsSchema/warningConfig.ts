import { storeToRefs } from 'pinia'
import useAvailabilityMasterData from '~/store/modules/useAvailabilityMasterData'
import { getCollapseTitle } from './commonFields'
import {
  priorityOptions,
  Priority,
} from '../constants'
import styles from '../index.module.scss'

import type { ISchema } from "@formily/vue"
import type { IGetSchemaParams } from '../interfaces'
import { Field } from '@formily/core'

const getSchema = ({ isView, form }: IGetSchemaParams): ISchema => {
  const { masterData } = storeToRefs(useAvailabilityMasterData())
  return {
    type: 'object',
    'x-decorator': 'Space',
    'x-decorator-props': {
      direction: 'column',
      align: 'start',
    },
    'x-component': 'FormCollapse.Item',
    'x-component-props': {
      title: getCollapseTitle({ index: 7, title: '告警配置' }),
    },
    properties: {
      method: {
        type: 'string',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          label: '告警方式',
          labelWidth: 90,
          style: {
            width: '100%',
            maxWidth: '753px',
          },
        },
        'x-component': 'Checkbox',
        'x-component-props': {
          label: 'telegram',
          disabled: true,
        },
        default: true,
      },
      notifier: {
        type: 'string',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          label: '通知人',
          labelWidth: 90,
          style: {
            width: '100%',
            maxWidth: '753px',
          },
        },
        'x-component': 'Select',
        'x-component-props': {
          placeholder: '请选择',
        },
        enum: masterData.value.monitors,
      },
      priority: {
        type: 'string',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          label: '告警优先级',
          labelWidth: 90,
          style: {
            width: '100%',
            maxWidth: '753px',
          },
        },
        'x-component': 'Select',
        'x-component-props': {
          placeholder: '请选择',
        },
        enum: priorityOptions,
        default: Priority.P1,
      },
      contentBox: {
        type: 'void',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          label: '通知内容',
          labelWidth: 90,
          style: {
            width: '100%',
            maxWidth: '753px',
          },
        },
        'x-component': 'Space',
        'x-component-props': {
          style: {
            width: '100%',
            maxWidth: '753px',
          },
          direction: 'column',
          fill: true,
        },
        properties: {
          operate: {
            type: 'void',
            'x-component': 'div',
            'x-component-props': {
              style: {
                display: 'flex',
                width: '100%',
            maxWidth: '753px',
              },
            },
            properties: {
              var: {
                type: 'string',
                'x-component': 'Select',
                'x-component-props': {
                  class: styles.leftRadius,
                  style: {
                    flex: 1,
                  },
                  multiple: true,
                },
                enum: masterData.value.variables,
                'x-display': isView ? 'none' : 'visible',
              },
              btn: {
                type: 'void',
                'x-component': 'ElButton',
                'x-component-props': {
                  class: styles.rightRadius,
                  onClick: () => {
                    const varField = form.value.query('collapse.warningConfig.contentBox.operate.var')?.take() as Field
                    if (!varField.value?.length) return
                    const contentField = form.value.query('collapse.warningConfig.contentBox.content')?.take() as Field
                    const result = (varField.value || []).map((v: string) => `{{${v}}}`).join(',')
                    contentField.setValue(`${contentField.value || ''}${result}`)
                    varField.setValue([])
                  }
                },
                'x-content': () => '添加',
                'x-display': isView ? 'none' : 'visible',
              }
            },
          },
          content: {
            type: 'string',
            'x-component': 'Input.TextArea',
            'x-component-props': {
              style: {
                width: '100%',
            maxWidth: '753px',
              },
              rows: 6,
              placeholder: '选择框中可引用平台中的变量，需要遵循规则${变量名}。\n告警模版：\n告警标题：${taskName}，\n告警时间：${alarmTime}，\n告警优先级：${priority}，\n告警内容：${结果判断}。',
            },
          }
        }
      }
    },
  }
}

export default getSchema