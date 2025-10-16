import { h } from 'vue'
import { ElRadioButton } from 'element-plus'
import { RadioGroup } from '~/basicComponents/radioGroup'
import Space from '~/basicComponents/space'
import { ROUTER_KEY } from './constants'
import styles from './index.module.scss'

import type { IRenderParams } from './interfaces'

/** tabs渲染器 */
export const tabsRender = ({
  routes,
  activeKey,
  router,
}: IRenderParams) => 
  h(
    Space,
    { 
      size: 0, 
      fill: true,
      style: {
        backgroundColor: '#F0F3F7',
      },
    },
    (routes || [])
      .map(v => (
        h(
          'div',
          {
            class: [styles.item, (activeKey === v[ROUTER_KEY]) && styles.active],
            style: { display: v?.meta?.hidden ? 'none' : 'block' },
            onClick: () => { router.push({ name: v[ROUTER_KEY] }) }
          },
          v?.meta?.title,
        )
      )),
  )

/** radioGroup渲染器 */
export const radioGroupRender = ({
  routes,
  activeKey,
  router,
}: IRenderParams) => 
  h(
    RadioGroup,
    {
      modelValue: activeKey,
      class: styles.radioGroup,
      options: (routes || []).map(v => ({
        label: v.meta.title,
        value: v[ROUTER_KEY] as string,
      })),
      onChange: (value: string):void => {
        router.push({ name: value })
      },
    },
    {
      option: ({ option }) => h(ElRadioButton, option)
    }
  )
