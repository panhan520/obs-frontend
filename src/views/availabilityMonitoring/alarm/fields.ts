import { h } from 'vue'
import { ElTag, ElLink } from 'element-plus'
import { execTimeFilterOptions, ExecTimeFilter } from '../taskHistory/constants'
import { Tabs } from '../overviewPage/constants'
import { subTypeOptions } from './constants'

import type { IField } from '~/businessComponents/commonPage'

export const getFields = (): IField[] => ([
  {
    prop: 'keyword',
    label: '搜索关键字',
    isFilter: true,
    filterConfig: {
      type: 'string',
      'x-decorator': 'FormGrid.GridColumn',
      'x-decorator-props': {
        gridSpan: 5,
      },
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入任务名称或者域名/地址进行搜索',
      },
    },
  },
  {
    prop: 'alertTime',
    label: '告警时间',
    isColumn: true,
    columnConfig: { width: 180 },
    isFilter: true,
    filterConfig: {
      type: 'void',
      'x-component': 'FormGrid.GridColumn',
      'x-component-props': {
        gridSpan: 4,
      },
      properties: {
        void: {
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
            'time': {
              type: 'string',
              'x-component': 'Radio.Group',
              'x-component-props': {
                buttonStyle: 'solid',
                optionType: 'button',
                style: {
                  marginRight: '8px',
                }
              },
              enum: execTimeFilterOptions,
              default: ExecTimeFilter.ALL,
            },
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
                style: {
                  width: '240px',
                },
              },
            },
          },
        }
      }
    },
  },
  {
    prop: 'monitoringUrl',
    label: '域名/地址',
    isColumn: true,
    columnConfig: { minWidth: 150 },
  },
  {
    prop: 'taskName',
    label: '任务名称',
    isColumn: true,
    columnConfig: { minWidth: 150 },
  },
  {
    prop: 'subType',
    label: '请求类型',
    isColumn: true,
    columnConfig: { width: 120 },
    isFilter: true,
    filterConfig: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
      },
      enum: subTypeOptions,
    },
  },
  {
    prop: 'monitoringNodeName',
    label: '监测节点',
    isColumn: true,
    columnConfig: { width: 150 },
    isFilter: true,
    filterConfig: {
      type: 'void',
      'x-component': 'FormGrid.GridColumn',
      'x-component-props': {
        gridSpan: 3,
      },
      properties: {
        void: {
          type: 'void',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: '监测节点',
            style: {
              marginBottom: '0',
            }
          },
          'x-component': 'div',
          'x-component-props': {
            style: {
              display: 'flex',
              gap: '8px',
            }
          },
          properties: {
            node: {
              type: 'string',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                style: {
                  marginBottom: '0'
                }
              },
              'x-component': 'Cascader',
            },
            probeIspName: {
              type: 'string',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                style: {
                  flex: 1,
                  marginBottom: '0'
                }
              },
              'x-component': 'Select',
            }
          }
        }
      },
    },
  },
  {
    prop: 'alertReason',
    label: '告警原因',
    isColumn: true,
    columnConfig: { minWidth: 200 },
  },
  {
    prop: 'alertPriority',
    label: '告警优先级',
    isColumn: true,
    columnConfig: {
      width: 120,
      render: ({ rowData }) => h(ElTag, { type: rowData.alarmPriority === '高' ? 'danger' : 'warning' }, rowData.alarmPriority),
    },
  },
  {
    prop: 'notifyUser',
    label: '通知人',
    isColumn: true,
    columnConfig: { width: 150 },
  },
  {
    prop: 'notifyResult',
    label: '通知结果',
    isColumn: true,
    columnConfig: {
      width: 120,
      render: ({ rowData }) => h(ElTag, { type: rowData.notifyResult ? 'success' : 'danger' }, rowData.notifyResult ? '成功' : '失败'),
    },
  },
  {
    prop: 'notifyTime',
    label: '通知时间',
    isColumn: true,
    columnConfig: { width: 180 },
  },
  {
    prop: 'notifyChannel',
    label: '通知方式',
    isColumn: true,
    columnConfig: { width: 120 },
  },
  {
    prop: 'operation',
    label: '操作',
    isColumn: true,
    columnConfig: {
      width: 150,
      fixed: 'right',
      render({ rowData }) {
        return h(
          'div', 
          {}, 
          [
            h(
              ElLink, 
              {
                type: 'primary',
                href: `/availabilityMonitoring/overviewPage?testId=${rowData?.testId}&requestType=${rowData?.subType}&activeKey=${Tabs.TaskHistory}`, 
                target: '_blank',
              }, 
              '查看全量实例',
            ),
          ],
        )
      },
    },
  },
])
