import { h } from 'vue'
import IconFont from '~/basicComponents/iconFont'
import Layout from '~/layout'
import { HeaderMode } from '../constants'
import type { IRouteRecordRaw } from '~/interfaces/common'

const configManagementRouter: IRouteRecordRaw[] = [
  {
    path: '/configMangeMent',
    name: 'configMangeMent',
    component: Layout,
    redirect: '/configMangeMent/agentPanel',
    meta: { title: '配置管理 ', icon: h(IconFont, { name: 'logs_panel' }), level: 1 },
    children: [
      {
        path: 'agentPanel',
        component: () => import('~/views/configManagement/index'),
        name: 'agentPanel',
        meta: { title: '安装Agent', level: 2, icon: h(IconFont, { name: 'logs_panel' }), headerMode: HeaderMode.SUBMENU },
      },
    ],
  },
]
export default configManagementRouter
