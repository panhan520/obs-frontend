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
    nodes: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '监控节点',
        labelWidth: 100,
      },
      'x-component': 'CommonLocations',
      'x-component-props': {
        placeholder: '请选择',
        clearable: true,
        fetchConfig: {
          api: getNodesApi,
          formatter: (list: Record<string, ILocationItem[]>[]) => {
            try {
              const result = list.reduce((initVal, curItem) => {
                const formattedCurItem = (Object.entries(curItem)?.[0]?.[1] || []).map((v1: ILocationItem) => ({
                  /** 节点id */
                  nodeId: v1.nodeId,
                  /** 所属地区id */
                  regionId: v1.zone,
                  /** 所属地区名称 */
                  regionName: v1.zone,
                  /** 所属省份 */
                  subdivision: v1.zone,
                  /** 所属城市 */
                  city: v1.nodeName,
                  /** 运营商唯一标识 */
                  asn: v1.ispCode,
                  /** 运营商 */
                  ispName: v1.ispName,
                  /** 用于前端友好展示的区域名称，比如：浙江杭州电信 */
                  friendlyArea: `${v1.nodeName}${v1.ispName}`,
                }))
                initVal = [...initVal, ...formattedCurItem]
                return initVal
              }, [])
              const nodesField = formRef.value.formRef.query('nodes')?.take() as Field
              nodesField.setComponentProps({
                ...(nodesField.componentProps || {}),
                options: result || [],
              })
              return result
            } catch (error: any) {
              console.error(`【节点】数据格式转换失败，失败原因：${error}`)
            }
          }
        } as IFetchConfig,
      },
      'x-reactions': '{{ fetchOptions }}',
    },
    project: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '归属项目',
        labelWidth: 100,
      },
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
        clearable: true,
        fetchConfig: {
          api: getProjectsApi,
          formatter: (res) => (res?.data?.list || []).map((v: Record<string, string>) => ({
            label: v.name,
            value: v.id,
          })),
        }
      },
      'x-reactions': '{{ fetchOptions }}',
    },
    frequency: {
      type: 'string',
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
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '通知渠道',
        labelWidth: 100,
      },
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
      },
      enum: noticeChannelOptions,
    },
    telegramChatId: {
      type: 'string',
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
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '任务状态',
        labelWidth: 100,
      },
      'x-component': 'Switch',
      default: false,
    },
  }
})

export default getSchema
