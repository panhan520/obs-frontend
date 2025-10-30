import { h, ref } from 'vue'
import { ElTag, ElButton } from 'element-plus'
import { getListApi as getAssetManagementListAPi } from '~/api/domainManagement/assetManagement'
import { CommonJsonPretty } from '~/businessComponents/commonJsonPretty'
import Space from '~/basicComponents/space'
import { MODE } from '~/businessComponents/commonPage'
import emitter from '~/utils/emitter'
import { domainStatusOptions, certStatusOptions } from './constants'

import type { IField } from '~/businessComponents/commonPage'
import type { ICommonObj } from '~/interfaces/common'

const curRowData = ref<ICommonObj>({})
const commonAttrs = {
  link: true,
}
const commonProps = {
  layout: 'vertical',
  colon: false,
}
export const getFields = ({ commonModalRef }): IField[] => ([
  {
    prop: 'domain',
    label: '域名',
    isColumn: true,
    columnConfig: { minWidth: 150 },
    isFilter: true,
    filterConfig: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入域名',
        clearable: true,
      },
    },
    isEdit: true,
    editConfig: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '旧域名',
        ...commonProps,
      },
      'x-component': 'Input',
      'x-component-props': {
        disabled: true,
        placeholder: '请输入',
      },
    },
  },
  {
    prop: 'newDomain',
    label: '新域名',
    isEdit: true,
    editConfig: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        label: '新域名',
        ...commonProps,
      },
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
      },
    },
    fetchConfig: {
      api: getAssetManagementListAPi,
      params: async () => ({ domain: curRowData.value.domain }),
      formatter: (res: Record<'list' | 'pagination', ICommonObj[] | ICommonObj>) => {
        return res?.list?.[0]?.backupDomain.map(v => ({ label: v, value: v })) || []
      },
    },
  },
  {
    prop: 'domainExpiry',
    label: '域名到期时间',
    isColumn: true,
    columnConfig: { width: 170 },
  },
  {
    prop: 'domainStatus',
    label: '域名状态',
    isColumn: true,
    columnConfig: {
      width: 120,
      // render: ({ rowData }) => h(ElTag, { type: domainStatusMap[rowData.domainStatus]?.type }, domainStatusMap[rowData.domainStatus]?.label),
    },
    isFilter: true,
    filterConfig: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择域名状态',
        clearable: true,
      },
      enum: domainStatusOptions,
    },
  },
  {
    prop: 'sslExpiry',
    label: '证书到期时间',
    isColumn: true,
    columnConfig: { width: 170 },
  },
  {
    prop: 'sslStatus',
    label: '证书状态',
    isColumn: true,
    columnConfig: {
      width: 120,
      // render: ({ rowData }) => h(ElTag, { type: certStatusMap[rowData.certStatus]?.type }, certStatusMap[rowData.certStatus]?.label),
    },
    isFilter: true,
    filterConfig: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择证书状态',
        clearable: true,
      },
      enum: certStatusOptions,
    },
  },
  {
    prop: 'pollution',
    label: '被污染',
    isColumn: true,
    columnConfig: { 
      width: 100,
      render: ({ rowData }) => h(ElTag, { type: rowData.blocked ? 'danger' : 'success' }, rowData.blocked ? '是' : '否'),
    },
  },
  {
    prop: 'isWall',
    label: '被墙',
    isColumn: true,
    columnConfig: {
      width: 100,
      render: ({ rowData }) => h(ElTag, { type: rowData.blocked ? 'danger' : 'success' }, rowData.blocked ? '是' : '否'),
    },
    isFilter: true,
    filterConfig: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择是否被墙',
        clearable: true,
      },
      enum: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
  },
  // {
  //   prop: 'pageInfo',
  //   label: '页面访问 http 消息',
  //   isColumn: true,
  //   columnConfig: { 
  //     minWidth: 150,
  //     render: ({ rowData }) => h(CommonJsonPretty, { data: rowData.pageInfo }),
  //   },
  // },
  {
    prop: 'dnsInfo',
    label: 'DNS 信息',
    isColumn: true,
    columnConfig: { 
      minWidth: 150,
      render: ({ rowData }) => h(CommonJsonPretty, { data: rowData.pageInfo }),
    },
  },
  {
    prop: 'icpInfo',
    label: '备案信息',
    isColumn: true,
    columnConfig: { 
      minWidth: 150,
      render: ({ rowData }) => h(CommonJsonPretty, { data: rowData.pageInfo }),
    },
  },
  // {
  //   prop: 'operation',
  //   label: '操作',
  //   isColumn: true,
  //   columnConfig: {
  //     width: 150,
  //     fixed: 'right',
  //     render({ rowData }) {
  //       return h(Space, {
  //         size: 0,
  //         justify: 'start',
  //       }, [
  //         h(ElButton, {
  //           type: 'primary',
  //           ...commonAttrs,
  //           onClick: (e: Event) => {  
  //             e.stopPropagation()
  //             curRowData.value = rowData
  //             emitter.emit('openEditor', { mode: MODE.EDIT, rowData, rowIndex: 0 })
  //           },
  //         }, '域名替换'),
  //         h(ElButton, {
  //           type: 'primary',
  //           ...commonAttrs,
  //           onClick: async () => {
  //             commonModalRef.value?.open?.()
  //           },
  //         }, '替换记录')
  //       ])
  //     }
  //   }
  // },
])
