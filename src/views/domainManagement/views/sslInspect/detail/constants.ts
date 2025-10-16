import CommonTable from "~/businessComponents/commonTable"
import { getHistoryListApi } from '~/api/domainManagement/sslInspect'
import fields from './fields'

import type { ICommonObj } from "@/interfaces/common"

/** tabs */
export enum Tabs {
  /** 历史快照 */
  HISTORY = 'HISTORY',
}

/** tabs的具体配置 */
export const getTabsToConfig = ({ route }) => ([
  {
    prop: Tabs.HISTORY,
    label: '历史快照',
    'x-component': CommonTable,
    'x-component-props': {
      columns: fields,
      listApi: getHistoryListApi,
      height: '93%',
      style: {
        height: '100%',
      },
      formatListParams: (params: ICommonObj) => ({ id: route?.query?.id, ...params }),
      needPagination: true,
    },
  },
])
