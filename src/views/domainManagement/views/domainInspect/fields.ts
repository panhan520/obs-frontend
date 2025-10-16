import { h } from 'vue'
import { ElButton, ElMessage, ElMessageBox, ElTag, ElText } from 'element-plus'
import { deleteApi, enableApi, disabledApi } from '~/api/domainManagement/domainInspect'
import { getProjectsApi } from '~/api/domainManagement/sslInspect'
import Space from '~/basicComponents/space'
import { MODE } from '~/businessComponents/commonPage'
import emitter from '~/utils/emitter'
import { inspectStatusMap, frequencyOptions, frequencyMap, noticeChannelOptions } from '../../constants/common'

import type { IField } from '~/businessComponents/commonPage'

const commonAttrs = {
  link: true,
}
const commonProps = {
  layout: 'vertical',
  colon: false,
}
export const getFields = ({ router, commonPageRef }): IField[] => ([
  {
    prop: 'inspectName',
    label: '名称',
    isColumn: true,
    columnConfig: { minWidth: 150 },
    isEdit: true,
    editConfig: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        ...commonProps,
        label: '任务名称',
      },
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
  },
  {
    prop: 'domain',
    label: '监控对象',
    isColumn: true,
    columnConfig: { minWidth: 150 },
    isFilter: true,
    filterConfig: {
      type: 'void',
      'x-component': 'FormGrid.GridColumn',
      'x-component-props': {
        gridSpan: 2,
      },
      properties: {
        domain: {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: '监控对象',
            style: {
              marginBottom: '0',
            },
          },
          'x-component': 'Input',
          'x-component-props': {
            placeholder: '请输入',
            clearable: true,
          },
        }
      },
    },
    isEdit: true,
    editConfig: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': commonProps,
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
  },
  {
    prop: 'project',
    label: '归属项目',
    isEdit: true,
    editConfig: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': commonProps,
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
        clearable: true,
      },
    },
    fetchConfig: {
      api: getProjectsApi,
      formatter: (res) => (res?.data?.list || []).map((v: Record<string, string>) => ({
        label: v.name,
        value: v.id,
      })),
    }
  },
  {
    prop: 'execTime',
    label: '执行时间',
    isFilter: true,
    filterConfig: {
      type: 'void',
      'x-component': 'FormGrid.GridColumn',
      'x-component-props': {
        gridSpan: 3,
      },
      properties: {
        'void': {
          type: 'void',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: '执行时间',
            style: {
              marginBottom: '0',
            }
          },
          'x-component': 'div',
          'x-component-props': {
            style: {
              display: 'flex',
            }
          },
          properties: {
            '[fromTime,toTime]': {
              type: 'string',
              'x-component': 'DatePicker',
              'x-component-props': {
                type: 'datetimerange',
                format: 'YYYY-MM-DD HH:mm',
                rangeSeparator: '至',
                valueFormat: 'YYYY-MM-DD HH:mm',
                startPlaceholder: '2025-08-05 08:00',
                endPlaceholder: '2025-08-05 21:00',
                clearable: true,
                style: {
                  width: '240px',
                },
              },
            },
          }
        }
      },
    },
  },
  {
    prop: 'taskStatus',
    label: '任务状态',
    isColumn: true,
    columnConfig: { 
      width: 120,
      render: ({ rowData }) => h(
        ElTag, 
        { type: rowData.taskStatus ? 'success' : 'danger' }, 
        rowData.taskStatus ? '启用' : '禁用'
      ),
    },
    isEdit: true,
    editConfig: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': commonProps,
      'x-component': 'Switch',
      'x-component-props': {
        placeholder: '请选择',
      },
      default: false,
    },
  },
  {
    prop: 'inspectStatus',
    label: '监控状态',
    isColumn: true,
    columnConfig: { 
      width: 120,
      render: ({ rowData }) => h(
        ElTag,
        { type: inspectStatusMap[rowData.inspectStatus]?.type || 'info' },
        inspectStatusMap[rowData.inspectStatus]?.text || 'null',
      ),
    },
  },
  {
    prop: 'frequency',
    label: '频率',
    isColumn: true,
    columnConfig: { 
      width: 120,
      render: ({ rowData }) => h(ElText, {}, frequencyMap[rowData.frequency]),
    },
    isEdit: true,
    editConfig: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        ...commonProps,
        label: '任务频率',
      },
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
        clearable: true,
      },
      enum: frequencyOptions,
    },
  },
  {
    prop: 'noticeMode',
    label: '通知渠道',
    isEdit: true,
    editConfig: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': commonProps,
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
        multiple: true,
        clearable: true,
      },
      enum: noticeChannelOptions,
    },
  },
  {
    prop: 'telegramChatId',
    label: 'Chat ID',
    isEdit: true,
    editConfig: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': commonProps,
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
  },
  {
    prop: 'telegramToken',
    label: 'Token',
    isEdit: true,
    editConfig: {
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-decorator-props': commonProps,
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
  },
  {
    prop: 'createdBy',
    label: '创建人',
    isColumn: true,
    columnConfig: { width: 120 },
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    isColumn: true,
    columnConfig: { width: 170 },
  },
  {
    prop: 'operation',
    label: '操作',
    isColumn: true,
    columnConfig: {
      width: 150,
      fixed: 'right',
      render({ rowData }) {
        const isEnable = rowData?.taskStatus
        const commonActions = {
          enable: {
            api: enableApi,
            text: '启用',
          },
          disable: {
            api: disabledApi,
            text: '禁用',
          },
        }
        return h(Space, {
          size: 0,
          justify: 'start',
        }, [
          h(ElButton, {
            type: 'danger',
            ...commonAttrs,
            onClick: async (e: Event) => {
              try {
                e.stopPropagation()
                await ElMessageBox.confirm(
                  '确认删除当前任务?',
                  {
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                    type: 'warning',
                  }
                )
                await deleteApi({ id: rowData.id })
                ElMessage({
                  message: `删除成功`,
                  type: 'success'
                })
                commonPageRef?.value?.query()
              } catch (error: any) {
                console.log(`取消刪除`)
              }
            },
          }, '删除'),
          h(ElButton, {
            type: 'primary',
            ...commonAttrs,
            onClick: (e: Event) => {  
              e.stopPropagation()
              emitter.emit('openEditor', { mode: MODE.EDIT, rowData, rowIndex: 0 })
            }
          }, '编辑'),
          h(ElButton, {
            type: 'primary',
            ...commonAttrs,
            onClick: (e: Event) => {  
              e.stopPropagation()
              router.push({ name: 'DomainDetail', query: { id: rowData.id } })
            }
          }, '查看'),
          h(ElButton, {
            type: isEnable ? 'warning' : 'success',
            ...commonAttrs,
            onClick: async (e: Event) => {  
              try {
                const text = isEnable ? commonActions.disable.text : commonActions.enable.text
                e.stopPropagation()
                await ElMessageBox.confirm(
                  `确认${text}当前任务?`,
                  {
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                    type: 'warning',
                  }
                )
                isEnable
                  ? await commonActions.disable.api({ id: rowData.id })
                  : await commonActions.enable.api({ id: rowData.id })
                ElMessage({
                  message: `${text}成功`,
                  type: 'success'
                })
                commonPageRef?.value?.query()
              } catch (error: any) {
                console.log(`取消操作`)
              }
            }
          }, isEnable ? commonActions.disable.text : commonActions.enable.text),
        ])
      }
    }
  },
])
