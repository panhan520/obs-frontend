import { h } from 'vue'
import { ElButton, ElTag, ElMessage, ElMessageBox, ElText } from 'element-plus'
import {
  deleteApi,
  getUsersProjectApi,
  getDetailApi,
  editApi,
} from '~/api/domainManagement/inspectionPollution'
import Space from '~/basicComponents/space'
import { MODE } from '~/businessComponents/commonPage'
import emitter from '~/utils/emitter'
import { frequencyOptions, telegramOptions } from './constants'
import { inspectStatusMap, frequencyMap } from '../../constants/common'
import type { IGetFieldsParams } from '../../../availabilityMonitoring/interface'

import type { IField } from '~/businessComponents/commonPage'

const commonAttrs = {
  link: true,
}
const commonProps = {
  layout: 'vertical',
  colon: false,
}
export const getFields = ({ router, commonPageRef }: IGetFieldsParams): IField[] => [
  {
    prop: 'inspectName',
    label: '任务名称',
    isColumn: true,
    columnConfig: {
      minWidth: 90,
    },
    isFilter: true,
    filterConfig: {
      type: 'void',
      properties: {
        search: {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-decorator-props': {
            label: '搜索',
          },
          'x-component-props': {
            placeholder: '请输入监控对象',
          },
        },
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
    prop: 'domain',
    label: '监控对象',
    isColumn: true,
    columnConfig: {
      minWidth: 150,
    },
    isFilter: true,
    filterConfig: {
      type: 'void',
      'x-component': 'FormGrid.GridColumn',
      'x-component-props': {
        gridSpan: 2,
      },
      properties: {
        void: {
          type: 'void',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: '日期范围',
            style: {
              marginBottom: '0',
            },
          },
          'x-component': 'div',
          'x-component-props': {
            style: {
              display: 'flex',
            },
          },
          properties: {
            time: {
              type: 'string',
              'x-component': 'Radio.Group',
              'x-component-props': {
                buttonStyle: 'solid',
                optionType: 'button',
                style: {
                  marginRight: '8px',
                },
              },
            },
            '[startDate,endDate]': {
              type: 'string',
              'x-component': 'DatePicker',
              'x-component-props': {
                type: 'datetimerange',
                format: 'YYYY-MM-DD',
                rangeSeparator: '至',
                valueFormat: 'YYYY-MM-DD',
                startPlaceholder: '开始日期',
                endPlaceholder: '结束日期',
                style: {
                  width: '140px',
                },
              },
            },
          },
        },
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
    prop: 'taskStatus',
    label: '任务状态',
    isColumn: true,
    columnConfig: {
      width: 90,
      render: ({ rowData }) =>
        h(
          ElTag,
          { type: rowData.taskStatus ? 'success' : 'danger' },
          rowData.taskStatus ? '启用' : '禁用',
        ),
    },
  },
  {
    prop: 'inspectStatus',
    label: '监控状态',
    isColumn: true,
    columnConfig: {
      width: 90,
      render: ({ rowData }) =>
        h(
          ElTag,
          { type: inspectStatusMap[rowData.inspectStatus]?.type || 'info' },
          inspectStatusMap[rowData.inspectStatus]?.text || 'null',
        ),
    },
  },
  {
    prop: 'project',
    label: '归属项目',
    isEdit: true,
    editConfig: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '归属项目',
        ...commonProps,
      },
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
      },
      enum: [],
    },
    fetchConfig: {
      api: getUsersProjectApi,
      formatter: (res) => {
        const list = res.data.list.map((item) => ({
          label: item.name,
          value: item.id,
        }))
        return list
      },
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
      'x-decorator-props': commonProps,
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
      },
      enum: frequencyOptions,
    },
  },
  {
    prop: 'createdBy',
    label: '创建人',
    isColumn: true,
    columnConfig: {
      width: 120,
    },
    isEdit: true,
    editConfig: {
      type: 'void',
      properties: {
        noticeMode: {
          type: 'string',
          required: true,
          default: 'telegram',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: '通知渠道',
            style: {
              display: 'block',
            },
          },
          'x-component': 'Select',
          'x-component-props': {
            placeholder: '请选择',
          },
          enum: telegramOptions,
        },
      },
    },
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    isColumn: true,
    columnConfig: {
      width: 170,
    },
    isEdit: true,
    editConfig: {
      type: 'void',
      properties: {
        telegramChatId: {
          type: 'string',
          required: true,
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: 'Chat ID',
            style: {
              display: 'block',
            },
          },
          'x-component': 'Input',
          'x-component-props': {
            placeholder: '请输入',
          },
        },
      },
    },
  },
  {
    prop: 'operation',
    label: '操作',
    isColumn: true,
    columnConfig: {
      width: 150,
      fixed: 'right',
      render({ rowData }) {
        const taskStatusName = rowData.taskStatus ? '禁用' : '启用'
        const isEnable = rowData?.taskStatus
        return h(
          Space,
          {
            size: 0,
            justify: 'start',
          },
          [
            h(
              ElButton,
              {
                type: 'danger',
                ...commonAttrs,
                onClick: async (e: Event) => {
                  try {
                    await ElMessageBox.confirm('确认删除当前任务?', {
                      confirmButtonText: '确认',
                      cancelButtonText: '取消',
                      type: 'warning',
                    })
                    await deleteApi(rowData)
                    ElMessage({
                      message: '删除成功',
                      type: 'success',
                    })
                    commonPageRef.value?.query()
                  } catch (error: any) {
                    console.error(`删除失败，失败原因：${error}`)
                  }
                },
              },
              '删除',
            ),
            h(
              ElButton,
              {
                type: 'primary',
                ...commonAttrs,
                onClick: async (e: Event) => {
                  e.stopPropagation()
                  const res = await getDetailApi(rowData)
                  emitter.emit('openEditor', { mode: MODE.EDIT, rowData: res, rowIndex: 0 })
                },
              },
              '编辑',
            ),
            h(
              ElButton,
              {
                type: 'primary',
                ...commonAttrs,
                onClick: async () => {
                  router.push({
                    path: 'inspectionPollutionLog',
                    query: {
                      id: rowData.id,
                    },
                  })
                },
              },
              '查看',
            ),
            h(
              ElButton,
              {
                type: isEnable ? 'warning' : 'success',
                ...commonAttrs,
                onClick: async () => {
                  try {
                    await ElMessageBox.confirm(
                      `确定要${taskStatusName}任务「${rowData.inspectName}」吗？`,
                      '确认',
                      {
                        confirmButtonText: '确认',
                        cancelButtonText: '取消',
                        type: 'warning',
                      },
                    )
                    await editApi({ id: rowData.id, taskStatus: !rowData.taskStatus })
                    ElMessage({
                      message: `${taskStatusName}成功`,
                      type: 'success',
                    })
                    commonPageRef.value?.query()
                  } catch (error: any) {
                    console.error(`失败，失败原因：${error}`)
                  }
                },
              },
              taskStatusName,
            ),
          ],
        )
      },
    },
    isEdit: true,
    editConfig: {
      type: 'void',
      properties: {
        telegramToken: {
          type: 'string',
          required: true,
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: 'Token',
            style: {
              display: 'block',
            },
          },
          'x-component': 'Input',
          'x-component-props': {
            placeholder: '请输入',
          },
        },
        taskStatus: {
          type: 'string',
          required: true,
          default: true,
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: '任务状态',
            style: {
              display: 'block',
            },
          },
          'x-component': 'Switch',
        },
      },
    },
  },
]
