import { h } from 'vue'
import { IconFont } from '~/KeepUp'
import Layout from '~/layout'
import { HeaderMode } from '../constants'

import type { IRouteRecordRaw } from '~/interfaces/common'

export default [
  {
    path: '/domainManagement',
    name: 'DomainManagement',
    component: Layout,
    redirect: '/domainManagement/assetManagement',
    meta: { title: '域名监测', icon: h(IconFont, { name: 'asset_management' }), level: 1 },
    children: [
      {
        path: 'assetManagement',
        name: 'AssetManagement',
        component: () => import('~/views/domainManagement/views/assetManagement'),
        meta: { title: '资产管理', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'detail',
        name: 'AssetManagementDetail',
        component: () => import('~/views/domainManagement/views/assetManagement/detail'),
        meta: {
          title: '资产详情',
          hidden: true,
          level: 2,
          breadcrumbConfig: [
            { label: '资产管理', name: 'AssetManagement' },
            { label: '资产详情', name: 'AssetManagementDetail' },
          ],
        },
      },
      {
        path: 'checkResults',
        name: 'CheckResults',
        component: () => import('~/views/domainManagement/views/checkResults'),
        meta: { title: '检测结果', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      // {
      //   path: 'httpInspect',
      //   name: 'HttpInspect',
      //   component: () => import('~/views/domainManagement/httpInspect'),
      //   meta: { title: 'HTTP检测', level: 2, headerMode: HeaderMode.SUBMENU },
      // },
      {
        path: 'hijackDetection',
        name: 'HijackDetection',
        component: () => import('~/views/domainManagement/views/hijackDetection'),
        meta: { title: '劫持检测', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'hijackDetectionCreate',
        name: 'HijackDetectionCreate',
        component: () => import('~/views/domainManagement/views/hijackDetection/detail/index'),
        meta: {
          title: '新增',
          hidden: true,
          level: 2,
          breadcrumbConfig: [
            { label: '劫持检测', name: 'HijackDetection' },
            { label: '新增', name: 'HijackDetectionCreate' },
          ],
        },
      },
      {
        path: 'hijackDetectionEdit',
        name: 'HijackDetectionEdit',
        component: () => import('~/views/domainManagement/views/hijackDetection/detail/index'),
        meta: {
          title: '编辑',
          hidden: true,
          level: 2,
          breadcrumbConfig: [
            { label: '劫持检测', name: 'HijackDetection' },
            { label: '编辑', name: 'HijackDetectionEdit' },
          ],
        },
      },
      {
        path: 'hijackDetectionView',
        name: 'HijackDetectionView',
        component: () => import('~/views/domainManagement/views/hijackDetection/view/index'),
        meta: {
          title: '查看',
          hidden: true,
          level: 2,
          breadcrumbConfig: [
            { label: '劫持检测', name: 'HijackDetection' },
            { label: '详情', name: 'HijackDetectionView' },
          ],
        },
      },
      {
        path: 'dnsInspect',
        name: 'DnsInspect',
        component: () => import('~/views/domainManagement/views/dnsInspect'),
        meta: { title: 'DNS检测', level: 2, headerMode: HeaderMode.SUBMENU },
      },

      {
        path: 'dnsInspectCreate',
        name: 'DnsInspectCreate',
        component: () => import('~/views/domainManagement/views/dnsInspect/detail/index'),
        meta: {
          title: '新增',
          hidden: true,
          level: 2,
          breadcrumbConfig: [
            { label: 'DNS检测', name: 'DnsInspect' },
            { label: 'DNS检测-新增', name: 'DnsInspectCreate' },
          ],
        },
      },
      {
        path: 'dnsInspectEdit',
        name: 'DnsInspectEdit',
        component: () => import('~/views/domainManagement/views/dnsInspect/detail/index'),
        meta: {
          title: '编辑',
          hidden: true,
          level: 2,
          breadcrumbConfig: [
            { label: 'DNS检测', name: 'DnsInspect' },
            { label: 'DNS检测-编辑', name: 'DnsInspectEdit' },
          ],
        },
      },
      {
        path: 'dnsInspectView',
        name: 'DnsInspectView',
        component: () => import('~/views/domainManagement/views/dnsInspect/view/index'),
        meta: {
          title: '查看',
          hidden: true,
          level: 2,
          breadcrumbConfig: [
            { label: 'DNS检测', name: 'DnsInspect' },
            { label: 'DNS检测-巡检日志', name: 'DnsInspectView' },
          ],
        },
      },
      {
        path: 'domainInspect',
        name: 'DomainInspect',
        component: () => import('~/views/domainManagement/views/domainInspect'),
        meta: { title: '域名检测', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'domainDetail',
        name: 'DomainDetail',
        component: () => import('~/views/domainManagement/views/domainInspect/detail/index'),
        meta: {
          title: '历史快照',
          hidden: true,
          level: 2,
          breadcrumbConfig: [
            { label: '域名检测', name: 'DomainInspect' },
            { label: '域名检测-巡检日志', name: 'DomainDetail' },
          ],
        },
      },
      {
        path: 'sslInspect',
        name: 'SslInspect',
        component: () => import('~/views/domainManagement/views/sslInspect'),
        meta: { title: 'ssl检测', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'sslDetail',
        name: 'SslDetail',
        component: () => import('~/views/domainManagement/views/sslInspect/detail/index'),
        meta: {
          title: '历史快照',
          hidden: true,
          level: 2,
          breadcrumbConfig: [
            { label: 'ssl检测', name: 'SslInspect' },
            { label: 'ssl检测-巡检日志', name: 'SslDetail' },
          ],
        },
      },
      {
        path: 'inspectionWall',
        name: 'InspectionWall',
        component: () => import('~/views/domainManagement/views/inspectionWall'),
        meta: { title: '被墙检测', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'inspectionWallLog',
        name: 'InspectionWallLog',
        component: () => import('~/views/domainManagement/views/inspectionWall/log'),
        meta: { title: '被墙检测-历史快照', hidden: true, level: 3 },
      },
      {
        path: 'inspectionPollution',
        name: 'InspectionPollution',
        component: () => import('~/views/domainManagement/views/inspectionPollution'),
        meta: { title: '污染检测', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'inspectionPollutionLog',
        name: 'InspectionPollutionLog',
        component: () => import('~/views/domainManagement/views/inspectionPollution/log'),
        meta: { title: '污染检测-历史快照', hidden: true, level: 3 },
      },
      {
        path: 'inspectionICP',
        name: 'InspectionICP',
        component: () => import('~/views/domainManagement/views/inspectionICP'),
        meta: { title: 'ICP检测', level: 2, headerMode: HeaderMode.SUBMENU },
      },
      {
        path: 'inspectionICPLog',
        name: 'InspectionICPLog',
        component: () => import('~/views/domainManagement/views/inspectionICP/log'),
        meta: { title: 'ICP检测-历史快照', hidden: true, level: 3 },
      },
    ],
  },
] as IRouteRecordRaw[]
