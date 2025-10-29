import { getNodesApi } from '~/api/domainManagement/dnsInspect'
import { getProjectsApi } from '~/api/domainManagement/sslInspect'
import { frequencyOptions, noticeChannelOptions } from '../../../constants/common'

import type { ISchema } from '@formily/vue'
import type { IFetchConfig } from '~/interfaces/commonPage'
import type { ILocationItem } from '~/api/domainManagement/dnsInspect/interfaces'
import { Field } from '@formily/core'

const getSchema = ({ formRef }): ISchema => ({
  type: 'object',
  properties: {
    inspectName: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '任务名称',
        labelWidth: 100,
      },
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入任务名称',
        clearable: true,
      },
    },
    domain: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '监控对象',
        labelWidth: 100,
      },
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入监控对象',
        clearable: true,
      },
    },
    whitelist: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '白名单',
        labelWidth: 100,
      },
      'x-component': 'Input.TextArea',
      'x-component-props': {
        placeholder: '可填写多个白名单域名，用‘空格’隔开',
        clearable: true,
      },
    },
    nodes: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '监控节点',
        labelWidth: 100,
      },
      'x-component': 'CommonLocations',
      'x-component-props': {
        placeholder: '请选择',
        clearable: true,
      },
      'x-reactions': '{{ fetchOptions }}',
    },
    frequency: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '任务频率',
        labelWidth: 100,
      },
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
      },
      enum: frequencyOptions,
    },
    noticeMode: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '通知渠道',
        labelWidth: 100,
      },
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
        disabled: true
      },
      enum: noticeChannelOptions,
      default: 'telegram',
    },
    telegramChatId: {
      type: 'string',
      // required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: 'Chat ID',
        labelWidth: 100,
      },
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入Chat ID',
      },
    },
    telegramToken: {
      type: 'string',
      // required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: 'Token',
        labelWidth: 100,
      },
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入 Token',
      },
    },
    taskStatus: {
      type: 'boolean',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '任务状态',
        labelWidth: 100,
      },
      'x-component': 'Switch',
      default: true,
    },
  }
})

export default getSchema
