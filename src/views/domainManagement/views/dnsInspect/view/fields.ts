import { h } from 'vue'
import { ElText } from 'element-plus'
import { zoneOptions, ispOptions } from './constants'

import type { Column } from 'element-plus'
import type { IField } from '~/interfaces/commonPage'


export const fields: IField[] = [
  {
    prop: 'index',
    label: '序号',
    isColumn: true,
    columnConfig: { minWidth: 50 },
  },
  {
    prop: 'custom',
    label: '监测点名称',
    isColumn: true,
    columnConfig: { 
      width: 100,
      render: ({ rowData }) => h(ElText, {}, `${rowData.nodeName}${rowData.ispName}`),
    },
  },
  {
    prop: 'zone',
    label: '地区',
    isColumn: true,
    columnConfig: { minWidth: 100 },
    isFilter: true,
    filterConfig: {
      type: 'string',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
        clearable: true,
      },
      enum: zoneOptions,
    },
  },
  {
    prop: 'ispName',
    label: '运营商',
    isColumn: true,
    columnConfig: { minWidth: 100 },
    isFilter: true,
    filterConfig: {
      type: 'string',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
        clearable: true,
      },
      enum: ispOptions,
    },
  },
]

export const historyFields: Column[] = [
  {
    prop: 'createdAt',
    label: '时间',
    width: 130,
  },
  {
    prop: 'nodeName',
    label: '节点',
    width: 130,
  },
  {
    prop: 'status',
    label: '状态',
    width: 130,
  },
  {
    prop: 'totalTime',
    label: '耗时（毫秒）',
    width: 130,
  },
  {
    prop: 'result',
    label: '运行结果',
    minWidth: 130,
  } as any,
]
