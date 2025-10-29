import { h } from 'vue'
import { ElButton, ElMessage, ElMessageBox, ElText } from 'element-plus'
import {
  deleteDataSource,
  getDataSourceDetail,
  updateDataSource,
} from '~/api/configManagement/dataSource'
import {
  dataSourceTypeOptions,
  dataTypeOptions,
} from '~/api/configManagement/dataSource/interfaces'
import Space from '~/KeepUp/packages/basicComponents/space'
import emitter from '~/utils/emitter'
import type { IGetFieldsParams } from '../../availabilityMonitoring/interface'

import type { IField } from '~/KeepUp/packages/businessComponents/commonPage'

const commonAttrs = {
  link: true,
}
export const getFields = ({ router, commonPageRef }: IGetFieldsParams): IField[] => [
  {
    prop: 'num',
    label: '序号',
    isColumn: true,
    columnConfig: {
      width: 60,
    },
  },
  {
    prop: 'name',
    label: '数据源名称',
    isColumn: true,
    columnConfig: {
      minWidth: 150,
    },
    isFilter: true,
    filterConfig: {
      type: 'void',
      properties: {
        name: {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-decorator-props': {
            label: '数据源名称',
          },
          'x-component-props': {
            placeholder: '请输入',
            clearable: true,
          },
        },
      },
    },
  },
  {
    prop: 'type',
    label: '数据源类型',
    isColumn: true,
    isFilter: true,
    filterConfig: {
      type: 'void',
      properties: {
        type: {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-decorator-props': {
            label: '数据源类型',
          },
          'x-component-props': {
            placeholder: '请选择',
            clearable: true,
          },
          enum: dataSourceTypeOptions,
        },
      },
    },
  },
  {
    prop: 'dataType',
    label: '数据类型',
    isColumn: true,
    isFilter: true,
    filterConfig: {
      type: 'void',
      properties: {
        dataType: {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-decorator-props': {
            label: '数据类型',
          },
          'x-component-props': {
            placeholder: '请选择',
            clearable: true,
          },
          enum: dataTypeOptions,
        },
      },
    },
  },
  {
    prop: 'source',
    label: '来源',
    isColumn: true,
  },
  {
    prop: 'description',
    label: '描述',
    isColumn: true,
  },
  {
    prop: 'updatedAt',
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
                  try {
                    // const res = await getDataSourceDetail(rowData.id)
                    // 通过事件总线通知父组件显示详情抽屉
                    const res = {
                      type: 'OPEN_SEARCH',
                      dataType: 'METRICS',
                      source: 'BUILT_IN',
                      createdAt: '2025-01-01',
                      updatedAt: '2025-01-01',
                      elasticSearch: {
                        url: 'http://localhost:9090',
                        httpHeader: [],
                      },
                    }
                    emitter.emit('showDataSourceDetail', res)
                  } catch (error) {
                    console.error('获取数据源详情失败:', error)
                    ElMessage({
                      message: '获取数据源详情失败',
                      type: 'error',
                    })
                  }
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
