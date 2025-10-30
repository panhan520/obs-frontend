import { h, defineAsyncComponent } from 'vue'
import { IconFont } from '~/KeepUp'
import { HeaderMode } from '../constants'

import type { IRouteRecordRaw } from '~/interfaces/common'

const logsPanelRouter: IRouteRecordRaw[] = [
  {
    path: '/logsPanel',
    name: 'logsPanel',
    component: defineAsyncComponent(() => import('~/layout')),
    redirect: '/logsPanel/discover',
    meta: { title: '日志', icon: h(IconFont, { name: 'logs_panel' }), level: 1 },
    children: [
      {
        path: 'discover',
        component: defineAsyncComponent(() => import('~/views/logsPanel/discover')),
        name: 'discover',
        meta: { title: '日志检索', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'indexManagement',
        component: defineAsyncComponent(() => import('~/views/logsPanel/indexManagement')),
        name: 'indexManagement',
        meta: { title: '索引管理', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'snapshot',
        component: defineAsyncComponent(() => import('~/businessComponents/commonIframePage')),
        name: 'snapshot',
        meta: { title: '快照管理', level: 2, headerMode: HeaderMode.SUBMENU },
      },
    ],
  },
]
export default logsPanelRouter
