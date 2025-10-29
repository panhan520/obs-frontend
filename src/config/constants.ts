import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

/** 代理枚举 */
export const PROXY = {
  /** 登录注册/仪表盘 */
  API: import.meta.env.VITE_APP_BASE_API,
  /** 指标和监控模块地址 */
  METRICS: import.meta.env.VITE_APP_BASE_API_METRICS,
  /** 线路可观测 */
  AVAILABILITY: import.meta.env.VITE_APP_BASE_API_AVAILABILITY,
  /** 域名 */
  DOMAIN: qiankunWindow.__POWERED_BY_QIANKUN__
    ? import.meta.env.VITE_APP_BASE_API_MICRO_APP_DOMAIN
    : import.meta.env.VITE_APP_BASE_API_DOMAIN,
  /** 追踪 */
  TRACE: qiankunWindow.__POWERED_BY_QIANKUN__
    ? import.meta.env.VITE_APP_BASE_API_MICRO_APP_TRACE
    : import.meta.env.VITE_APP_BASE_API_TRACE,
  /** AI智能体 */
  AIAGENT: import.meta.env.VITE_APP_BASE_API_AIAGENT,
  /**仪表盘 */
  USER: import.meta.env.VITE_APP_USER_API,
  /**账户信息 */
  CORE: import.meta.env.VITE_APP_CORE_API,
  /**opensearch */
  OPENSEARCH: import.meta.env.VITE_APP_OPENSEARCH_API,
  /** 日志 */
  LOG: import.meta.env.VITE_APP_BASE_API_LOG,
  DATASOURCE: import.meta.env.VITE_APP_BASE_API_DATASOURCE,
}
