/** 顶部展示形式 */
export enum HeaderMode {
  /** 面包屑 */
  BREADCRUMB = 'BREADCRUMB',
  /** 子菜单 */
  SUBMENU = 'SUBMENU',
}
const OPENSEARCH_API = import.meta.env.VITE_APP_OPENSEARCH_API
export const OpensearchUrl = {
  /** 日志检索 */
  DISCOVER: `${OPENSEARCH_API}/app/data-explorer/discover#?_a=(discover:(columns:!(_source),isDirty:!f,sort:!()),metadata:(indexPattern:ff959d40-b880-11e8-a6d9-e546fe2bba5f,view:discover))&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_q=(filters:!(),query:(language:kuery,query:''))`,
  /** 索引管理 */
  INDEXMANEGEMENT: `${OPENSEARCH_API}/app/opensearch_index_management_dashboards#/index-policies`,
  /**快照管理 */
  SNAPSHOT: `${OPENSEARCH_API}/app/opensearch_index_management_dashboards#/snapshot-policies?from=0&queryString=&size=20&sortField=name&sortOrder=desc`,
}
