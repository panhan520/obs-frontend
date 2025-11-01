/** 代理枚举 */
export const PROXY = {
  /** 登录注册/仪表盘 */
  API: import.meta.env.VITE_APP_BASE_API,
  /** 指标和监控模块地址 */
  METRICS: import.meta.env.VITE_APP_BASE_API_METRICS,
  /** 线路可观测 */
  AVAILABILITY: import.meta.env.VITE_APP_BASE_API_AVAILABILITY,
  /** 域名 */
  DOMAIN: import.meta.env.VITE_APP_BASE_API_DOMAIN,
  /** 追踪 */
  TRACE: import.meta.env.VITE_APP_BASE_API_TRACE,
  /** AI智能体 */
  AIAGENT: import.meta.env.VITE_APP_BASE_API_AIAGENT,
  /**仪表盘 */
  USER: import.meta.env.VITE_APP_USER_API,
  /**索引管理 */
  INDEXMANAGEMENT: import.meta.env.VITE_INDEXMANAGEMENT_MICRO_API,
  /** 日志 */
  LOG: import.meta.env.VITE_APP_BASE_API_LOG,

  /**账户信息 */
  CORE: import.meta.env.VITE_APP_CORE_API,
  /** 数据源 */
  DATASOURCE: import.meta.env.VITE_APP_BASE_API_DATASOURCE,
}
