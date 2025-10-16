/**
 * @description: 路由参数介绍
 * path ==> 路由路径
 * name ==> 路由名称
 * component ==> 路由组件
 * redirect ==> 路由重定向
 * alwaysShow ==> 如果设置为true，将始终显示根菜单，无论其子路由长度如何
 * hidden ==> 如果“hidden:true”不会显示在侧边栏中（默认值为false）
 * keepAlive ==> 设为true 缓存
 * meta ==> 路由元信息
 * meta.title ==> 路由标题
 * meta.icon ==> 菜单icon
 * meta.affix ==> 如果设置为true将会出现在 标签栏中
 * meta.breadcrumb ==> 如果设置为false，该项将隐藏在breadcrumb中（默认值为true）
 */
import { createRouter, createWebHistory } from 'vue-router'
import Layout from '~/layout'
import {
  domainManagement,
  availabilityMonitoring,
  controlPanel,
  logsPanel,
  monitorsPanel,
  system,
  metrics,
  configManagement
} from './modules'

import type { IRouteRecordRaw } from '~/interfaces/common'

export const customRoutes: IRouteRecordRaw[] = [
  ...system,
  ...controlPanel,
  ...availabilityMonitoring,
  ...domainManagement,
  ...metrics,
  ...logsPanel,
  ...monitorsPanel,
  // ...nested,
  ...configManagement
]
export const basicRoutes: IRouteRecordRaw[] = [
  {
    path: '/404',
    name: '404',
    component: () => import('~/config/fragments/errorPages/404.vue'),
    meta: { title: '404', hidden: true },
  },
  {
    path: '/403',
    name: '403',
    component: () => import('~/config/fragments/errorPages/403.vue'),
    meta: { title: '403', hidden: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('~/views/login/index.vue'),
    meta: { title: 'Login', hidden: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('~/views/login/index.vue'),
    meta: { title: 'register', hidden: true },
  },
  {
    path: '/resetPsw',
    name: 'resetPsw',
    component: () => import('~/views/login/resetPsw.vue'),
    meta: { title: 'resetPsw', hidden: true },
  },
  {
    path: '/',
    name: 'layout',
    component: Layout,
    redirect: '/controlPanel/dashBoard',
    // meta: { icon: 'House', level: 1 },
    children: [
      // {
      //   path: '/home',
      //   component: () => import('~/views/home/index.vue'),
      //   name: 'home',
      //   meta: { title: '经常打开', icon: h(IconFont, { name: 'home' }), role: ['other'], level: 2 },
      // },
    ],
  },
]
export const notFoundRouter: IRouteRecordRaw = {
  path: '/:pathMatch(.*)',
  name: 'notFound',
  redirect: '/404',
}
export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: basicRoutes,
})
