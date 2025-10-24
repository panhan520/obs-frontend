import type { ISchema } from '@formily/vue'

/** getRootSchema入参 */
export interface IGetRootSchema {
  /** 列数 */
  maxColumns: number
  /** 属性 */
  properties: ISchema
}

/** 对象 */
export interface ICommonObj {
  [k: string]: any
}

/** 获取列表出参 */
export interface ICommonGetListRes<L> {
  /** list */
  list: L
  /** 分页信息 */
  pagination: {
    /** 页码 */
    page: number
    /** 每页展示条数 */
    pageSize: number
    /** 总条目 */
    total: number
  }
}

/** 获取列表 */
export type IListApi = (p?: ICommonObj) => Promise<ICommonGetListRes<any[]>>
