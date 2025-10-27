import { h } from 'vue'
import { ElButton, ElMessage, ElMessageBox, ElText } from 'element-plus'
import {
  deleteDataSource,
  getDataSourceDetail,
  updateDataSource,
} from '~/api/configManagement/dataSource'
import Space from '~/KeepUp/packages/basicComponents/space'
import emitter from '~/utils/emitter'
import type { IGetFieldsParams } from '../../availabilityMonitoring/interface'

import type { IField } from '~/KeepUp/packages/businessComponents/commonPage'

const commonAttrs = {
  link: true,
}
export const getFields = ({ router, commonPageRef }: IGetFieldsParams): IField[] => [
  {
    prop: 'inspectName',
    label: '序号',
    isColumn: true,
    columnConfig: {
      width: 60,
      render({ rowIndex }) {
        return h(ElText, {}, `${rowIndex + 1}`)
      },
    },
  },
  {
    prop: 'domain',
    label: '数据源名称',
    isColumn: true,
    columnConfig: {
      minWidth: 150,
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
            label: '数据源名称',
          },
          'x-component-props': {
            placeholder: '请输入',
          },
        },
      },
    },
  },
  {
    prop: 'taskStatus',
    label: '数据源类型',
    isColumn: true,
    isFilter: true,
    filterConfig: {
      type: 'void',
      properties: {
        search: {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-decorator-props': {
            label: '数据源类型',
          },
          'x-component-props': {
            placeholder: '请选择',
          },
        },
      },
    },
  },
  {
    prop: 'inspectStatus',
    label: '数据类型',
    isColumn: true,
    isFilter: true,
    filterConfig: {
      type: 'void',
      properties: {
        search: {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-decorator-props': {
            label: '数据类型',
          },
          'x-component-props': {
            placeholder: '请选择',
          },
        },
      },
    },
  },
  {
    prop: 'project',
    label: '来源',
    isColumn: true,
  },
  {
    prop: 'frequency',
    label: '描述',
    isColumn: true,
  },
  {
    prop: 'createdAt',
    label: '最近更新时间',
    isColumn: true,
    columnConfig: {
      width: 120,
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
                    await deleteDataSource(rowData.id)
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
                onClick: async () => {
                  router.push({
                    path: 'dataSourceForm',
                    query: {
                      id: rowData.id,
                    },
                  })
                },
              },
              '编辑',
            ),
            h(
              ElButton,
              {
                type: 'primary',
                ...commonAttrs,
                onClick: async (e: Event) => {
                  e.stopPropagation()
                  // const res = await getDataSourceDetail(rowData.id)
                  // 通过事件总线通知父组件显示详情抽屉
                  console.log(1)
                  emitter.emit('showDataSourceDetail')
                },
              },
              '详情',
            ),
          ],
        )
      },
    },
  },
]
