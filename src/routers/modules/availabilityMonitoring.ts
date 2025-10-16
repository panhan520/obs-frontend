import { h } from 'vue'
import IconFont from '~/basicComponents/iconFont'
import Layout from '~/layout'
import { HeaderMode } from '../constants'

import type { IRouteRecordRaw } from '~/interfaces/common'

export default [
  {
    path: '/availabilityMonitoring',
    name: 'AvailabilityMonitoring',
    component: Layout,
    redirect: 'index',
    meta: { title: '线路', icon: h(IconFont, { name: 'availability_monitoring' }), level: 1 },
    children: [
      {
        path: 'index',
        name: 'AvailabilityMonitoringIndex',
        component: () => import('~/views/availabilityMonitoring'),
        meta: { title: '线路任务列表', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'create',
        name: 'AvailabilityMonitoringCreate',
        component: () => import('~/views/availabilityMonitoring/detail'),
        meta: { 
          title: '新建线路任务', 
          role: ['other'], 
          level: 3, 
          headerHidden: true,
          breadcrumbConfig: [
            { label: '线路任务列表', name: 'AvailabilityMonitoringIndex', },
            { label: '新建线路任务', name: 'AvailabilityMonitoringCreate', },
          ],
        },
      },
      {
        path: 'edit',
        name: 'AvailabilityMonitoringEdit',
        component: () => import('~/views/availabilityMonitoring/detail'),
        meta: { 
          title: '编辑任务',  
          hidden: true, 
          role: ['other'], 
          level: 3,
          breadcrumbConfig: [
            { label: '线路任务列表', name: 'AvailabilityMonitoringIndex', },
            { label: '编辑任务', name: 'AvailabilityMonitoringEdit', },
          ],
        },
      },
      {
        path: 'view',
        name: 'AvailabilityMonitoringView',
        component: () => import('~/views/availabilityMonitoring/detail'),
        meta: { 
          title: '查看任务',  
          hidden: true, 
          role: ['other'], 
          level: 3,
          breadcrumbConfig: [
            { label: '线路任务列表', name: 'AvailabilityMonitoringIndex', },
            { label: '查看任务', name: 'AvailabilityMonitoringView', },
          ],
        },
      },
      {
        path: 'taskHistory',
        name: 'TaskHistory',
        component: () => import('~/views/availabilityMonitoring/taskHistory'),
        meta: { 
          title: '历史任务', 
          hidden: true, 
          role: ['other'], 
          level: 3,
          breadcrumbConfig: [
            { label: '线路任务列表', name: 'AvailabilityMonitoringIndex', },
            { label: '历史任务', name: 'TaskHistory', },
          ],
        },
      },
      {
        path: 'overviewPage',
        name: 'OverviewPage',
        component: () => import('~/views/availabilityMonitoring/overviewPage'),
        meta: { 
          title: '任务信息总览', 
          hidden: true, 
          role: ['other'], 
          level: 3,
          breadcrumbConfig: [
            { label: '线路任务列表', name: 'AvailabilityMonitoringIndex', },
            { label: '任务信息总览', name: 'OverviewPage', },
          ],
        },
      },
      {
        path: 'alarm',
        name: 'Alarm',
        component: () => import('~/views/availabilityMonitoring/alarm'),
        meta: { 
          title: '告警', 
          role: ['other'],
          level: 2,
          headerMode: HeaderMode.SUBMENU,
        },
      },
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('~/views/availabilityMonitoring/overview'),
        meta: { 
          title: '概览', 
          role: ['other'],
          level: 2,
          headerMode: HeaderMode.SUBMENU,
        },
      },
    ]
  },
] as IRouteRecordRaw[]
