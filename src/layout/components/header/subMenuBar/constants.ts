import Space from '~/basicComponents/space'
import { tabsRender, radioGroupRender } from './utils'

import type { ILevelMapItem } from './interfaces'

/** 跳转方式 */
export const ROUTER_KEY = 'name'

/** 菜单层级到对应配置的map */
export const getLevelMap = (names: string[]): (ILevelMapItem | null)[] => ([
  null,
  {
    activeKey: names?.[1],
    'x-decorator': Space,
    'x-decorator-props': {
      size: 0,
    },
    'x-component-props': {
      style: {
        backgroundColor: '#F0F3F7',
      },
    },
    'x-component': tabsRender,
  },
  {
    activeKey: names?.[2],
    'x-decorator': Space,
    'x-component': radioGroupRender,
  },
  {
    activeKey: names?.[3],
    'x-decorator': Space,
    'x-component': radioGroupRender,
  },
])
