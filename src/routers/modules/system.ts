import type { IRouteRecordRaw } from '~/interfaces/common'
import Layout from '~/layout'

const systemRouter: IRouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    component: Layout,
    redirect: '/system/basicInfo',
    meta: { title: '账户信息', level: 1, hidden: true },
    children: [
      {
        path: 'basicInfo',
        component: () => import('~/views/system/basicInfo/index.vue'),
        name: 'basicInfo',
        meta: { title: '账户信息', level: 2 },
      },
    ],
  },
]
export default systemRouter
