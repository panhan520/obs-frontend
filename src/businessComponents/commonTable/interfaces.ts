import type { Ref, UnwrapNestedRefs } from 'vue'
import type { TableRefs } from 'element-plus'
import type { IListApi } from '~/interfaces/common'
import type { ICommonFilterExpose } from '../commonFilter'

/** CommonTable内获取列表方法 */
type IGetList = (currentPage?: number, pageSize?: number, text?: string) => Promise<void>

/** usePagination入参 */
export interface IUsePaginationParams {
  /** 当前页码 */
  currentPage: Ref<number>
  /** commonFilterRef */
  commonFilterRef: Ref<ICommonFilterExpose>
  /** 设置选中值 */
  setSelected: (p: any[]) => void
  /** 业务获取列表方法 */
  listApi: IListApi
  /** 格式化列表接口入参 */
  formatListParams: (p: any) => any
}

/** page信息  */
export interface IPagination {
  /** 当前页码 */
  page: number
  /** 每页展示的条数 */
  pageSize: number
  /** 总条数 */
  total?: number
}

/** usePagination出参 */
export interface IUsePaginationRes {
  /** table数据源 */
  data: Ref<any[]>
  /** page信息  */
  pagination: UnwrapNestedRefs<IPagination>
  /** CommonTable内获取列表方法 */
  getList: IGetList
}

/** 设置选中值入参 */
export interface ISetSelectedParams {
  /** tableRef */
  tableRef: Ref<TableRefs>
  /** 选中值 */
  selected: any[]
  /** 行标识 */
  rowKey: string
  /** table数据源 */
  data: any[]
}

/** commonTable出参 */
export interface ICommonTableExpose {
  /** page信息 会自动解包，所以无需Ref  */
  pagination: IPagination
  /** CommonTable内获取列表方法 */
  getList: IGetList
}
