import { h } from 'vue'
import { ElText } from 'element-plus'
import { getHistoryNodeListApi } from '~/api/domainManagement/hijackDetection'
import { ispOptions } from './constants'

import styles from './index.module.scss'

import type { IField } from '~/interfaces/commonPage'

export const fields: IField[] = [
  {
    prop: 'index',
    label: '序号',
    isColumn: true,
    columnConfig: {
      minWidth: 50,
      render: ({ rowIndex }) => h('span', {}, String(rowIndex + 1)),
    },
  },
  {
    prop: 'nodeName',
    label: '监测节点',
    isColumn: true,
    columnConfig: {
      width: 200,
      render: ({ rowData }) => h(ElText, {}, `${rowData.nodeName}`),
    },
  },
  {
    prop: 'zone',
    label: '区域',
    isColumn: true,
    isFilter: true, filterConfig: {
      type: 'void',
      'x-component': 'FormGrid.GridColumn',
      'x-component-props': {
        gridSpan: 1,
      },
      properties: {
        'zone': {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: '',
            style: {
              marginBottom: '0',
            }
          },
          'x-component': 'Select',
          'x-component-props': {
            placeholder: '请选择',
            clearable: true,
          },
        }
      },
    },
    fetchConfig: {
      api: getHistoryNodeListApi,
      formatter: (res) => ([...new Set(res.list.map(v => v.zone))]),
    },
  },
  {
    prop: 'ispName',
    label: '运营商',
    isFilter: true,
    filterConfig: {
      type: 'void',
      'x-component': 'FormGrid.GridColumn',
      'x-component-props': {
        gridSpan: 2,
      },
      properties: {
        'ispName': {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: '',
            style: {
              marginBottom: '0',
            }
          },
          'x-component': 'Select',
          'x-component-props': {
            placeholder: '请选择',
            clearable: true,
          },
          enum: ispOptions,
        }
      },
    },
  },
  {
    prop: 'search',
    label: '监测点名称',
    isFilter: true,
    filterConfig: {
      type: 'void',
      'x-component': 'FormGrid.GridColumn',
      'x-component-props': {
        gridSpan: 1,
      },
      properties: {
        'search': {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            label: '',
            style: {
              marginBottom: '0',
            }
          },
          'x-component': 'Input',
          'x-component-props': {
            placeholder: '请输入',
          },
        }
      },
    },
  },
]

export const historyFields: IField[] = [
  {
    prop: 'createdAt',
    label: '执行时间',
    width: 150,
  },
  {
    prop: 'nodeName',
    label: '监控节点',
    width: 200,
  },
  // {
  //   prop: 'analyzeIpAddress',
  //   label: '解析IP',
  //   width: 130,
  // },
  // {
  //   prop: 'ipLocation',
  //   label: 'IP所在地',
  //   width: 130,
  // },
  {
    prop: 'status',
    label: '结果',
    isFilter: true,
    width: 130,
    filterConfig: {
      type: 'string',
      default: '',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
      },
      enum: [
        { label: '被劫持', value: 'fail' },
        { label: '正常', value: 'success' },
        { label: '异常', value: 'else' },
      ],
    },
    render: ({ rowData }) => h(
      'span',
      { style: { color: rowData.status == '正常' ? '#67C23A' : '#F56C6C' } },
      rowData.status
    )
  },
  {
    prop: 'statusCode',
    label: '状态码',
    minWidth: 130,
  },
  {
    prop: 'jumpAddress',
    label: '跳转地址',
    width: 130,
  },
  {
    prop: 'result',
    label: '运行结果',
    showOverflowTooltip: {
      popperClass: styles.limitTooltip,
    },
    minWidth: 250,
    render: ({ rowData }) => h('span', JSON.stringify(rowData.result))
  } as any,
]
