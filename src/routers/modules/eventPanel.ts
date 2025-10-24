import { h } from 'vue'
import { IconFont } from '~/KeepUp'
import Layout from '~/layout'

import type { IRouteRecordRaw } from '~/interfaces/common'

const controlPanelRouter: IRouteRecordRaw[] = [
  {
    path: '/eventPanel',
    name: 'eventPanel',
    component: Layout,
    redirect: '/eventPanel/event',
    meta: { title: '事件', icon: h(IconFont, { name: 'event_panel' }), level: 1 },
    children: [
      {
        path: 'event',
        component: () => import('@/views/controlPanel/dashBoard/index.vue'),
        name: 'event',
        meta: { title: '异常日志', level: 2 },
      },
      {
        path: 'eventA',
        component: () => import('@/views/controlPanel/dashBoard/importDashBoard.vue'),
        name: 'eventA',
        meta: { title: '异常指标', level: 2 },
      },
      {
        path: 'eventB',
        component: () => import('@/views/controlPanel/dashBoard/importDashBoard.vue'),
        name: 'eventB',
        meta: { title: '未恢复事件', level: 2 },
      },
    ],
  },
]
export default controlPanelRouter
