/** 域名状态 */
export enum DOMAIN_STATUS {
  /** 正常 */
  NORMAL = 'NORMAL',
  /** 未备案 */
  UNREG = 'UNREG',
  /** 快到期 */
  NEAR = 'NEAR',
  /** 已到期 */
  EXPIRED = 'EXPIRED',
}

/** 域名状态 */
export enum CERT_STATUS {
  /** 正常 */
  NORMAL = 'NORMAL',
  /** 快到期 */
  NEAR = 'NEAR',
  /** 已到期 */
  EXPIRED = 'EXPIRED',
}
