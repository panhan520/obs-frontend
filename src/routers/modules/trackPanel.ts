import { h } from 'vue'
import { IconFont } from '~/KeepUp'
import Layout from '~/layout'

import type { IRouteRecordRaw } from '~/interfaces/common'

const controlPanelRouter: IRouteRecordRaw[] = [
  {
    path: '/trackPanel',
    name: 'trackPanel',
    component: Layout,
    redirect: '/trackPanel/tracked',
    meta: { title: '追踪', icon: h(IconFont, { name: 'track_panel' }), level: 1 },
    children: [
      {
        path: 'tracked',
        component: () => import('@/views/controlPanel/dashBoard/index.vue'),
        name: 'tracked',
        meta: { title: '追踪', icon: h(IconFont, { name: 'track_panel' }), level: 2 },
      },
    ],
  },
]
export default controlPanelRouter
