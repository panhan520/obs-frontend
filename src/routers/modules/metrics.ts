import { h } from 'vue'
import { IconFont } from '~/KeepUp'
import Layout from '~/layout'
import { HeaderMode } from '../constants'

import type { IRouteRecordRaw } from '~/interfaces/common'

const controlPanelRouter: IRouteRecordRaw[] = [
  {
    path: '/metrics',
    name: 'Metrics',
    component: Layout,
    redirect: '/metrics/metricsExplorer',
    meta: { title: '指标', icon: h(IconFont, { name: 'target_panel' }), level: 1 },
    children: [
      {
        path: 'metricsExplorer',
        component: () => import('@/views/metrics'),
        name: 'MetricsExplorer',
        meta: {
          title: '即时查询',
          level: 2,
          url: '/metric/explorer',
          headerMode: HeaderMode.SUBMENU,
        },
      },
      {
        path: 'builtInMetrics',
        component: () => import('@/views/metrics'),
        name: 'BuiltInMetrics',
        meta: {
          title: '指标视图',
          level: 2,
          url: '/metrics-built-in',
          headerMode: HeaderMode.SUBMENU,
        },
      },
      {
        path: 'quickView',
        component: () => import('@/views/metrics'),
        name: 'QuickView',
        meta: {
          title: '快捷视图',
          level: 2,
          url: '/object/explorer',
          headerMode: HeaderMode.SUBMENU,
        },
      },
    ],
  },
]
export default controlPanelRouter
