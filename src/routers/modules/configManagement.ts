import { h, defineAsyncComponent } from 'vue'
import { IconFont } from '~/KeepUp'
import { HeaderMode } from '../constants'

import type { IRouteRecordRaw } from '~/interfaces/common'

const configManagementRouter: IRouteRecordRaw[] = [
  {
    path: '/configMangeMent',
    name: 'configMangeMent',
    component: defineAsyncComponent(() => import('~/layout')),
    redirect: '/configMangeMent/agentPanel',
    meta: { title: '配置管理 ', icon: h(IconFont, { name: 'logs_panel' }), level: 1 },
    children: [
      {
        path: 'agentPanel',
        component: defineAsyncComponent(() => import('~/views/configManagement/agent/index')),
        name: 'agentPanel',
        meta: {
          title: '安装Agent',
          level: 2,
          headerMode: HeaderMode.SUBMENU,
        },
      },
      {
        path: 'dataSource',
        component: () => import('~/views/configManagement/dataSource/index'),
        name: 'dataSource',
        meta: {
          title: '数据源管理',
          level: 2,
          headerMode: HeaderMode.SUBMENU,
        },
      },
      {
        path: 'dataSourceForm',
        name: 'DataSourceForm',
        component: () => import('~/views/configManagement/dataSource/edit/index'),
        meta: { title: '数据源配置', hidden: true, level: 3 },
      },
    ],
  },
]
export default configManagementRouter
