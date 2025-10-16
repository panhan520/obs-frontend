import { h } from 'vue'
import { ElTag } from 'element-plus'
import { DOMAIN_STATUS, CERT_STATUS } from '@/api/domainManagement/checkResults/constants'

/** 使用中 */
export const isActiveOptions = [
  { label: '是', value: true },
  { label: '否', value: false },
]

/** 域名状态options */
export const domainStatusOptions = [
  { label: '正常', value: DOMAIN_STATUS.NORMAL },
  { label: '未备案', value: DOMAIN_STATUS.UNREG },
  { label: '快到期', value: DOMAIN_STATUS.NEAR },
  { label: '已到期', value: DOMAIN_STATUS.EXPIRED },
]

/** 域名状态 */
export const domainStatusMap = {
  [DOMAIN_STATUS.NORMAL]: {
    label: '正常', type: 'primary',
  },
  [DOMAIN_STATUS.UNREG]: {
    label: '未备案', type: 'info',
  },
  [DOMAIN_STATUS.NEAR]: {
    label: '快到期', type: 'warning',
  },
  [DOMAIN_STATUS.EXPIRED]: {
    label: '已到期', type: 'danger',
  },
}

/** 证书状态options */
export const certStatusOptions = [
  { label: '正常', value: CERT_STATUS.NORMAL },
  { label: '快到期', value: CERT_STATUS.NEAR },
  { label: '已到期', value: CERT_STATUS.EXPIRED },
]

/** 证书状态 */
export const certStatusMap = {
  [CERT_STATUS.NORMAL]: {
    label: '正常', type: 'primary',
  },
  [CERT_STATUS.NEAR]: {
    label: '快到期', type: 'warning',
  },
  [CERT_STATUS.EXPIRED]: {
    label: '已到期', type: 'danger',
  },
}

/** 替换状态 */
export enum Status {
  SUCCESS = 'success',
  FAIL = 'fail,'
}

/** 替换状态 */
export const statusMap = {
  [Status.SUCCESS]: {
    text: '成功',
    type: 'success',
  },
  [Status.FAIL]: {
    text: '失败',
    type: 'danger',
  },
}

/** 替换记录 */
export const columns = [
  {
    prop: 'createdAt',
    label: '替换时间',
    width: 174,
  },
  {
    prop: 'oldDomain',
    label: '旧域名',
    width: 174,
  },
  {
    prop: 'newDomain',
    label: '新域名',
    width: 174,
  },
  {
    prop: 'status',
    label: '替换状态',
    width: 174,
    render: ({ rowData }) =>
      h(
        ElTag,
        { type: statusMap[rowData.status]?.type },
        () => statusMap[rowData.status]?.text,
      ),
  },
]
