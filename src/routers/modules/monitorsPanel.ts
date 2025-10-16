import { h } from 'vue'
import IconFont from '~/basicComponents/iconFont'
import Layout from '~/layout'
import { HeaderMode } from '../constants'

import type { IRouteRecordRaw } from '~/interfaces/common'

const controlPanelRouter: IRouteRecordRaw[] = [
  {
    path: '/monitor',
    name: 'Monitor',
    component: Layout,
    redirect: '/monitor/alert',
    meta: { title: '监控', icon: h(IconFont, { name: 'monitors_panel' }), level: 1 },
    children: [
      {
        path: 'alert',
        component: () => import('@/views/monitor'),
        name: 'Alert',
        redirect: '/monitor/alert/alertRules',
        meta: { title: '告警管理', level: 2, headerMode: HeaderMode.SUBMENU },
        children: [
          {
            path: 'alertRules',
            component: () => import('@/views/monitor'),
            name: 'AlertRules',
            meta: {
              title: '告警规则',
              level: 3,
              url: '/alert-rules',
              headerMode: HeaderMode.SUBMENU,
            },
          },
          {
            path: 'mutes',
            component: () => import('@/views/monitor'),
            name: 'Mutes',
            meta: {
              title: '屏蔽规则',
              level: 3,
              url: '/alert-mutes',
              headerMode: HeaderMode.SUBMENU,
            },
          },
          {
            path: 'subscribes',
            component: () => import('@/views/monitor'),
            name: 'Subscribes',
            meta: {
              title: '订阅规则',
              level: 3,
              url: '/alert-subscribes',
              headerMode: HeaderMode.SUBMENU,
            },
          },
          {
            path: 'tpls',
            component: () => import('@/views/monitor'),
            name: 'Tpls',
            meta: {
              title: '自愈脚本',
              level: 3,
              url: '/job-tpls',
              headerMode: HeaderMode.SUBMENU,
            },
          },
          {
            path: 'tasks',
            component: () => import('@/views/monitor'),
            name: 'Tasks',
            meta: {
              title: '历史任务',
              level: 3,
              url: '/job-tasks',
              headerMode: HeaderMode.SUBMENU,
            },
          },
          {
            path: 'curEvents',
            component: () => import('@/views/monitor'),
            name: 'CurEvents',
            meta: {
              title: '活跃告警',
              level: 3,
              url: '/alert-cur-events',
              headerMode: HeaderMode.SUBMENU,
            },
          },
          {
            path: 'hisEvents',
            component: () => import('@/views/monitor'),
            name: 'HisEvents',
            meta: {
              title: '历史告警',
              level: 3,
              url: '/alert-his-events',
              headerMode: HeaderMode.SUBMENU,
            },
          },
        ],
      },
      {
        path: 'notification',
        component: () => import('@/views/monitor'),
        name: 'Notification',
        redirect: '/monitor/notification/notificationRules',
        meta: { title: '通知管理', level: 2, headerMode: HeaderMode.SUBMENU },
        children: [
          {
            path: 'notificationRules',
            component: () => import('@/views/monitor'),
            name: 'NotificationRules',
            meta: {
              title: '通知规则',
              level: 3,
              url: '/notification-rules',
              headerMode: HeaderMode.SUBMENU,
            },
          },
          {
            path: 'channels',
            component: () => import('@/views/monitor'),
            name: 'Channels',
            meta: {
              title: '通知媒介',
              level: 3,
              url: '/notification-channels',
              headerMode: HeaderMode.SUBMENU,
            },
          },
          {
            path: 'templates',
            component: () => import('@/views/monitor'),
            name: 'Templates',
            meta: {
              title: '消息模板',
              level: 3,
              url: '/notification-templates',
              headerMode: HeaderMode.SUBMENU,
            },
          },
        ],
      },
    ],
  },
]
export default controlPanelRouter
