import { h, defineAsyncComponent } from 'vue'
import emitter from '~/utils/emitter'
import { IconFont } from '~/KeepUp'
import { HeaderMode } from '../constants'

import type { IRouteRecordRaw } from '~/interfaces/common'

const controlPanelRouter: IRouteRecordRaw[] = [
  {
    path: '/controlPanel',
    name: 'controlPanel',
    component: defineAsyncComponent(() => import('../../layout')),
    redirect: '/controlPanel/dashBoard',
    meta: { title: '仪表盘', icon: h(IconFont, { name: 'control_panel' }), level: 1 },
    children: [
      {
        path: 'dashBoard',
        component: defineAsyncComponent(() => import('@/views/controlPanel/dashBoard/index.vue')),
        name: 'dashBoard',
        meta: { title: '仪表盘详情', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'dashBoard1',
        name: 'dashBoard1',
        component: null,
        meta: {
          title: '新增仪表盘',
          level: 2,
          headerHidden: true,
          baseName: 'dashBoard',
          action: async ({ router }) => {
            await router.push({ name: 'dashBoard' })
            setTimeout(() => {
              emitter.emit('DASHBOARD_OPEN')
            }, 500);
          },
        },
      },
      {
        path: 'importDashBoard',
        component: defineAsyncComponent(() => import('@/views/controlPanel/dashBoard/importDashBoard.vue')),
        name: 'importDashBoard',
        meta: { title: '导入仪表盘', level: 2, hidden: true, affix: true },
      },
      {
        path: 'dashBoardIframe',
        component: defineAsyncComponent(() => import('~/businessComponents/commonIframePage')),
        name: 'dashBoardIframe',
        props: () => ({
          iframeUrl: sessionStorage.getItem('iframeUrl')?.trim() || ''
        }),
        meta: { title: '仪表盘详情', level: 2, hidden: true, affix: true },
      },
    ],
  },
]
export default controlPanelRouter
